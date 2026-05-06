<template>
  <div class="page" ref="pageRef">
    <img src="../assets/bg-circle.png" class="bg-circle" />
    <img src="../assets/left.png" class="deco deco-left" />
    <img src="../assets/right.png" class="deco deco-right" />

    <header class="loading-header">
      <img src="../assets/awooLogo.svg" alt="awoo logo" class="logo" />
      <h1 class="title">阿物科技前進高雄</h1>
    </header>

    <div
      ref="arenaRef"
      :class="['lottery-arena', phase === 'reveal' ? 'is-revealing' : '']"
      :style="{ '--ball-size': ballSize + 'px' }"
    >
      <div
        v-for="(meta, i) in ballMeta"
        :key="meta.name"
        :ref="(el) => setBallRef(el, i)"
        class="lottery-ball"
      >
        <div class="ball-avatar" :style="{ background: meta.gradient }">
          <img
            v-if="meta.avatarUrl"
            :src="meta.avatarUrl"
            :alt="meta.name"
            @error="onAvatarError(i)"
          />
          <span v-else>{{ meta.initials }}</span>
        </div>
        <span class="ball-name">{{ meta.name }}</span>
      </div>

      <div class="winner-reveal" v-if="phase === 'reveal'">
        <div
          v-for="(winner, i) in winners"
          :key="winner"
          class="winner-card"
          :style="{
            animationDelay: i * 0.6 + 's',
            '--card-w': winnerCardWidth,
          }"
        >
          <div
            class="winner-avatar"
            :style="{ background: getAvatarGradient(winner) }"
          >
            <img
              v-if="getAvatarUrl(winner)"
              :src="getAvatarUrl(winner)"
              :alt="winner"
            />
            <span v-else>{{ getInitials(winner) }}</span>
          </div>
          <span class="winner-name">{{ winner }}</span>
        </div>
      </div>
    </div>

    <div class="music-player">
      <audio ref="audio" src="./loading-music.mp3" autoplay id="audio"></audio>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
  import {
    getAvatarGradient,
    getAvatarUrl,
    getInitials,
  } from '../libs/avatar';

  interface IProps {
    nameList: string[];
    winners: string[];
  }
  const props = defineProps<IProps>();
  const emit = defineEmits<{ (e: 'done'): void }>();

  const phase = ref<'flying' | 'reveal'>('flying');
  const pageRef = ref<HTMLElement | null>(null);
  const arenaRef = ref<HTMLElement | null>(null);

  // Plain (non-reactive) array of DOM nodes — we mutate transforms directly
  // every frame to avoid Vue reactivity overhead at 60 fps × N balls.
  const ballEls: (HTMLElement | null)[] = [];
  const setBallRef = (el: unknown, i: number) => {
    ballEls[i] = el as HTMLElement | null;
  };

  // Avatar errors fall back to gradient + initials. We mutate the
  // metadata object's avatarUrl (it IS reactive) so the <img> unmounts
  // and the <span> with initials renders.
  const ballMetaState = reactive(
    props.nameList.map((name) => ({
      name,
      avatarUrl: getAvatarUrl(name) ?? '',
      gradient: getAvatarGradient(name),
      initials: getInitials(name),
    })),
  );
  const ballMeta = computed(() => ballMetaState);
  const onAvatarError = (i: number) => {
    if (ballMetaState[i]) ballMetaState[i].avatarUrl = '';
  };

  const winnerCardWidth = computed(() => {
    const n = props.winners.length;
    if (n <= 1) return 'min(360px, 80vw)';
    if (n <= 3) return 'min(260px, 40vw)';
    if (n <= 6) return 'min(200px, 30vw)';
    return 'min(160px, 22vw)';
  });

  const ballSize = computed(() => {
    const n = props.nameList.length;
    if (n <= 12) return 96;
    if (n <= 24) return 80;
    if (n <= 48) return 64;
    if (n <= 80) return 52;
    return 44;
  });

  const rand = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };

  // ---- Physics ----
  // Plain array, not reactive. Each entry holds the live position /
  // velocity / rotation of one ball; we read it every frame and write
  // the result into ballEls[i].style.transform.
  interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    rotVel: number;
  }
  const balls: Ball[] = [];

  let rafId = 0;
  let lastT = 0;

  const initPhysics = () => {
    if (!arenaRef.value) return;
    const W = arenaRef.value.clientWidth;
    const H = arenaRef.value.clientHeight;
    const r = ballSize.value / 2;
    const speed = 360; // px/sec
    balls.length = 0;
    for (let i = 0; i < props.nameList.length; i++) {
      const angle = rand(i * 5.1 + 0.7) * Math.PI * 2;
      const sp = speed * (0.7 + rand(i * 9.3 + 1.1) * 0.6); // 0.7×–1.3× base
      balls.push({
        x: rand(i * 1.3 + 0.1) * Math.max(0, W - 2 * r) + r,
        y: rand(i * 2.7 + 0.5) * Math.max(0, H - 2 * r) + r,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        rot: rand(i * 11.7) * 360,
        rotVel: (rand(i * 13.9) - 0.5) * 240, // deg/sec
      });
    }
  };

  const step = (now: number) => {
    if (phase.value === 'reveal' || !arenaRef.value) {
      rafId = 0;
      return;
    }
    const dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 0.016;
    lastT = now;

    const W = arenaRef.value.clientWidth;
    const H = arenaRef.value.clientHeight;
    const r = ballSize.value / 2;
    const N = balls.length;

    // Integrate + bounce off walls
    for (let i = 0; i < N; i++) {
      const b = balls[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot += b.rotVel * dt;
      if (b.x < r) {
        b.x = r;
        b.vx = Math.abs(b.vx);
        b.rotVel = -b.rotVel;
      } else if (b.x > W - r) {
        b.x = W - r;
        b.vx = -Math.abs(b.vx);
        b.rotVel = -b.rotVel;
      }
      if (b.y < r) {
        b.y = r;
        b.vy = Math.abs(b.vy);
        b.rotVel = -b.rotVel;
      } else if (b.y > H - r) {
        b.y = H - r;
        b.vy = -Math.abs(b.vy);
        b.rotVel = -b.rotVel;
      }
    }

    // Pairwise elastic collisions (O(N²) — fine up to ~150 balls)
    for (let i = 0; i < N; i++) {
      const a = balls[i];
      for (let j = i + 1; j < N; j++) {
        const c = balls[j];
        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const distSq = dx * dx + dy * dy;
        const minD = 2 * r;
        if (distSq > 0.0001 && distSq < minD * minD) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          // Separate so they don't sink into each other
          const overlap = (minD - dist) / 2;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          c.x += nx * overlap;
          c.y += ny * overlap;
          // Swap velocity along the collision normal (equal-mass elastic)
          const va = a.vx * nx + a.vy * ny;
          const vc = c.vx * nx + c.vy * ny;
          const diff = vc - va;
          a.vx += nx * diff;
          a.vy += ny * diff;
          c.vx -= nx * diff;
          c.vy -= ny * diff;
          // Add a touch of spin from the impact for visual flavor
          a.rotVel += (rand(i * j + 1) - 0.5) * 80;
          c.rotVel -= (rand(i * j + 2) - 0.5) * 80;
        }
      }
    }

    // Apply transforms imperatively
    for (let i = 0; i < N; i++) {
      const el = ballEls[i];
      if (!el) continue;
      const b = balls[i];
      el.style.transform = `translate3d(${b.x - r}px, ${b.y - r}px, 0) rotate(${b.rot}deg)`;
    }

    rafId = requestAnimationFrame(step);
  };

  const onResize = () => {
    if (!arenaRef.value) return;
    const W = arenaRef.value.clientWidth;
    const H = arenaRef.value.clientHeight;
    const r = ballSize.value / 2;
    // Clamp positions back inside the new viewport
    for (const b of balls) {
      if (b.x < r) b.x = r;
      if (b.x > W - r) b.x = W - r;
      if (b.y < r) b.y = r;
      if (b.y > H - r) b.y = H - r;
    }
  };

  let timers: number[] = [];
  onMounted(() => {
    // Defer physics init one frame so the arena has its measured size.
    requestAnimationFrame(() => {
      initPhysics();
      lastT = 0;
      rafId = requestAnimationFrame(step);
    });
    window.addEventListener('resize', onResize);

    // Stagger each winner reveal by STAGGER_MS so the audience sees them
    // dropped one at a time. Total run time scales with winner count;
    // App.vue waits for the `done` event instead of a fixed 5s timer.
    const FLYING_MS = 3000;
    const STAGGER_MS = 600;
    const POP_MS = 800;
    const TAIL_MS = 1100;

    timers.push(
      window.setTimeout(() => {
        phase.value = 'reveal';
      }, FLYING_MS),
    );
    const totalMs =
      FLYING_MS +
      Math.max(0, props.winners.length - 1) * STAGGER_MS +
      POP_MS +
      TAIL_MS;
    timers.push(
      window.setTimeout(() => {
        emit('done');
      }, totalMs),
    );
  });

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    timers.forEach((t) => clearTimeout(t));
  });
</script>

<style scoped>
  .page {
    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100svh;
    overflow: hidden;
    color: #222;
  }

  .bg-circle {
    position: absolute;
    width: 100%;
    bottom: -10%;
    left: 0;
    z-index: 0;
    pointer-events: none;
  }

  .deco {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    max-height: 30vh;
    object-fit: contain;
  }
  .deco-left {
    left: 2vw;
    bottom: 5vh;
  }
  .deco-right {
    right: 2vw;
    bottom: 5vh;
  }

  /* Header floats above the bouncing balls. Translucent so balls
     visible behind it instead of getting clipped. */
  .loading-header {
    position: absolute;
    top: clamp(12px, 3vh, 32px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(6px, 1.2vh, 14px);
    pointer-events: none;
  }
  .logo {
    width: clamp(48px, 8vh, 86px);
    height: auto;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18));
  }
  .title {
    font-weight: 800;
    font-size: clamp(24px, 5vw, 60px);
    line-height: 1.1;
    letter-spacing: 0.15em;
    color: #cd0000;
    margin: 0;
    text-align: center;
    text-shadow: 0 2px 8px rgba(255, 239, 239, 0.95),
      0 4px 14px rgba(255, 239, 239, 0.7);
  }

  /* The arena fills the entire page so balls can bounce edge-to-edge,
     just like balls inside an actual lottery box. */
  .lottery-arena {
    position: absolute;
    inset: 0;
    z-index: 5;
    overflow: hidden;
  }

  .lottery-ball {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    /* No CSS animation — JS physics drives transform every frame. */
    will-change: transform;
    pointer-events: none;
    transform: translate3d(-100vw, -100vw, 0); /* off-screen until first tick */
  }

  .ball-avatar {
    width: var(--ball-size, 80px);
    height: var(--ball-size, 80px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: calc(var(--ball-size, 80px) * 0.32);
    border: 3px solid #fff;
    box-shadow: 0 8px 20px rgba(205, 0, 0, 0.25),
      inset 0 -6px 12px rgba(0, 0, 0, 0.18),
      inset 0 6px 10px rgba(255, 255, 255, 0.35);
    overflow: hidden;
    user-select: none;
  }

  .ball-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ball-name {
    background: #fff;
    color: #cd0000;
    border-radius: 100px;
    padding: 2px 10px;
    font-size: clamp(11px, 1.4vw, 14px);
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    max-width: min(160px, 26vw);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* On reveal, fade balls out at their last physics-set position. We
     don't override transform here — JS keeps whatever it set last so
     the ball doesn't snap to (0,0). */
  .lottery-arena.is-revealing .lottery-ball {
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  .winner-reveal {
    position: absolute;
    inset: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: clamp(12px, 3vw, 32px);
    padding: 0 clamp(12px, 3vw, 40px);
    pointer-events: none;
  }

  .winner-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(6px, 1.4vh, 14px);
    width: var(--card-w, 200px);
    animation: drop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  }

  .winner-avatar {
    width: clamp(80px, 16vh, 160px);
    height: clamp(80px, 16vh, 160px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: clamp(28px, 5vh, 56px);
    border: 5px solid #fff;
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.85),
      0 12px 30px rgba(205, 0, 0, 0.35),
      inset 0 -10px 20px rgba(0, 0, 0, 0.18),
      inset 0 10px 20px rgba(255, 255, 255, 0.35);
    overflow: hidden;
    animation: glow 1.4s ease-in-out infinite alternate;
  }

  .winner-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .winner-name {
    background: #cd0000;
    color: #fff;
    border-radius: 100px;
    padding: 6px 22px;
    font-size: clamp(16px, 2.6vh, 28px);
    font-weight: 800;
    letter-spacing: 0.06em;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
    text-align: center;
    line-height: 1.25;
  }

  @keyframes drop-in {
    0% {
      opacity: 0;
      transform: translate3d(0, -65vh, 0) scale(0.55) rotate(-12deg);
    }
    55% {
      opacity: 1;
      transform: translate3d(0, 18px, 0) scale(1.12) rotate(6deg);
    }
    72% {
      transform: translate3d(0, -10px, 0) scale(0.97) rotate(-3deg);
    }
    86% {
      transform: translate3d(0, 4px, 0) scale(1.02) rotate(1deg);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1) rotate(0);
    }
  }

  @keyframes glow {
    0% {
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.6),
        0 12px 30px rgba(205, 0, 0, 0.35),
        inset 0 -10px 20px rgba(0, 0, 0, 0.18),
        inset 0 10px 20px rgba(255, 255, 255, 0.35);
    }
    100% {
      box-shadow: 0 0 60px rgba(255, 215, 0, 1),
        0 12px 40px rgba(205, 0, 0, 0.5),
        inset 0 -10px 20px rgba(0, 0, 0, 0.18),
        inset 0 10px 20px rgba(255, 255, 255, 0.35);
    }
  }

  @media (max-width: 768px) {
    .deco {
      max-height: 18vh;
      opacity: 0.6;
    }
    .ball-name {
      padding: 1px 8px;
    }
  }

  @media (max-width: 480px) {
    .deco {
      display: none;
    }
  }
</style>
