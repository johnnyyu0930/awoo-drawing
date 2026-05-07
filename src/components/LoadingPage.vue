<template>
  <div class="page" ref="pageRef">
    <img src="../assets/bg-circle.png" class="bg-circle" />
    <img src="../assets/left.png" class="deco deco-left" />
    <img src="../assets/right.png" class="deco deco-right" />

    <header class="loading-header" ref="headerRef">
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
      </div>

      <div
        class="winner-reveal"
        v-if="phase === 'reveal'"
        :style="winnerRevealStyle"
      >
        <div
          v-for="(winner, i) in winners"
          :key="winner"
          class="winner-card"
          :style="{
            animationDelay: i * 0.6 + 's',
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
  const headerRef = ref<HTMLElement | null>(null);
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

  const POP_SOUND_SRC = `${import.meta.env.BASE_URL}pop.wav`;
  const activePopPlayers = new Set<HTMLAudioElement>();

  const playPopSound = () => {
    const player = new Audio(POP_SOUND_SRC);
    const cleanup = () => {
      activePopPlayers.delete(player);
      player.removeEventListener('ended', cleanup);
      player.removeEventListener('error', cleanup);
    };

    activePopPlayers.add(player);
    player.addEventListener('ended', cleanup);
    player.addEventListener('error', cleanup);
    void player.play().catch(() => {
      cleanup();
    });
  };

  const winnerRevealStyle = computed<Record<string, string>>(() => {
    const n = props.winners.length;
    const winnerRevealTop = `${Math.ceil(headerClearance.value)}px`;
    if (n <= 1) {
      return {
        '--winner-reveal-top': winnerRevealTop,
        '--card-w': 'min(360px, 80vw)',
        '--winner-reveal-gap': 'clamp(12px, 3vw, 32px)',
        '--winner-reveal-pad-x': 'clamp(12px, 3vw, 40px)',
        '--winner-reveal-pad-y': 'clamp(8px, 2vh, 20px)',
        '--winner-card-gap': 'clamp(6px, 1.4vh, 14px)',
        '--winner-avatar-size': 'clamp(80px, 16vh, 160px)',
        '--winner-avatar-font-size': 'clamp(28px, 5vh, 56px)',
        '--winner-avatar-border': '5px',
        '--winner-name-size': 'clamp(16px, 2.6vh, 28px)',
        '--winner-name-px': '22px',
        '--winner-name-py': '6px',
      };
    }
    if (n <= 3) {
      return {
        '--winner-reveal-top': winnerRevealTop,
        '--card-w': 'min(260px, 40vw)',
        '--winner-reveal-gap': 'clamp(12px, 2.6vw, 28px)',
        '--winner-reveal-pad-x': 'clamp(12px, 3vw, 36px)',
        '--winner-reveal-pad-y': 'clamp(8px, 2vh, 18px)',
        '--winner-card-gap': 'clamp(6px, 1.3vh, 14px)',
        '--winner-avatar-size': 'clamp(76px, 15vh, 140px)',
        '--winner-avatar-font-size': 'clamp(24px, 4.4vh, 48px)',
        '--winner-avatar-border': '5px',
        '--winner-name-size': 'clamp(15px, 2.4vh, 24px)',
        '--winner-name-px': '18px',
        '--winner-name-py': '6px',
      };
    }
    if (n <= 6) {
      return {
        '--winner-reveal-top': winnerRevealTop,
        '--card-w': 'min(200px, 30vw)',
        '--winner-reveal-gap': 'clamp(10px, 2vw, 24px)',
        '--winner-reveal-pad-x': 'clamp(10px, 2.4vw, 28px)',
        '--winner-reveal-pad-y': 'clamp(8px, 1.6vh, 16px)',
        '--winner-card-gap': 'clamp(6px, 1vh, 12px)',
        '--winner-avatar-size': 'clamp(72px, 13vh, 120px)',
        '--winner-avatar-font-size': 'clamp(22px, 3.8vh, 42px)',
        '--winner-avatar-border': '4px',
        '--winner-name-size': 'clamp(14px, 2.2vh, 22px)',
        '--winner-name-px': '16px',
        '--winner-name-py': '5px',
      };
    }
    if (n <= 12) {
      return {
        '--winner-reveal-top': winnerRevealTop,
        '--card-w': 'min(150px, 20vw)',
        '--winner-reveal-gap': 'clamp(8px, 1.8vw, 18px)',
        '--winner-reveal-pad-x': 'clamp(8px, 2vw, 24px)',
        '--winner-reveal-pad-y': 'clamp(6px, 1.4vh, 14px)',
        '--winner-card-gap': 'clamp(5px, 0.9vh, 10px)',
        '--winner-avatar-size': 'clamp(58px, 10.5vh, 96px)',
        '--winner-avatar-font-size': 'clamp(18px, 3.2vh, 32px)',
        '--winner-avatar-border': '4px',
        '--winner-name-size': 'clamp(12px, 1.9vh, 18px)',
        '--winner-name-px': '12px',
        '--winner-name-py': '4px',
      };
    }
    if (n <= 20) {
      return {
        '--winner-reveal-top': winnerRevealTop,
        '--card-w': 'min(112px, 18vw)',
        '--winner-reveal-gap': 'clamp(6px, 1.2vw, 12px)',
        '--winner-reveal-pad-x': 'clamp(6px, 1.4vw, 16px)',
        '--winner-reveal-pad-y': 'clamp(4px, 1vh, 10px)',
        '--winner-card-gap': 'clamp(4px, 0.7vh, 8px)',
        '--winner-avatar-size': 'clamp(44px, 7.4vh, 72px)',
        '--winner-avatar-font-size': 'clamp(14px, 2.4vh, 24px)',
        '--winner-avatar-border': '3px',
        '--winner-name-size': 'clamp(10px, 1.6vh, 14px)',
        '--winner-name-px': '8px',
        '--winner-name-py': '3px',
      };
    }

    return {
      '--winner-reveal-top': winnerRevealTop,
      '--card-w': 'min(96px, 15vw)',
      '--winner-reveal-gap': 'clamp(4px, 1vw, 10px)',
      '--winner-reveal-pad-x': 'clamp(6px, 1.2vw, 14px)',
      '--winner-reveal-pad-y': 'clamp(4px, 0.8vh, 8px)',
      '--winner-card-gap': 'clamp(3px, 0.6vh, 6px)',
      '--winner-avatar-size': 'clamp(40px, 6.5vh, 60px)',
      '--winner-avatar-font-size': 'clamp(12px, 2vh, 20px)',
      '--winner-avatar-border': '3px',
      '--winner-name-size': 'clamp(9px, 1.4vh, 12px)',
      '--winner-name-px': '6px',
      '--winner-name-py': '3px',
    };
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

  const HEADER_CLEARANCE_GAP = 12;
  const headerClearance = ref(0);

  const getHeaderBottom = () => {
    if (!pageRef.value || !headerRef.value) return 0;

    const pageRect = pageRef.value.getBoundingClientRect();
    const headerRect = headerRef.value.getBoundingClientRect();
    return Math.max(0, headerRect.bottom - pageRect.top);
  };

  const updateHeaderClearance = () => {
    headerClearance.value = getHeaderBottom() + HEADER_CLEARANCE_GAP;
  };

  const getBallTopBoundary = (r: number) => {
    if (!pageRef.value || !headerRef.value) return r;

    const headerBottom = getHeaderBottom();
    const sampleBallEl = ballEls.find(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    const ballWidth = sampleBallEl?.offsetWidth ?? ballSize.value;
    const ballHeight = sampleBallEl?.offsetHeight ?? ballSize.value;
    const rotatedExtent = Math.hypot(ballWidth, ballHeight) / 2;
    const centerOffset = ballHeight / 2 - r;

    return Math.max(
      r,
      headerBottom + HEADER_CLEARANCE_GAP + rotatedExtent - centerOffset,
    );
  };

  const initPhysics = () => {
    if (!arenaRef.value) return;
    const W = arenaRef.value.clientWidth;
    const H = arenaRef.value.clientHeight;
    const r = ballSize.value / 2;
    const minY = getBallTopBoundary(r);
    const maxY = Math.max(minY, H - r);
    const speed = 3600; // px/sec — 20× a calmer 360 baseline, real lottery-machine chaos
    balls.length = 0;
    for (let i = 0; i < props.nameList.length; i++) {
      const angle = rand(i * 5.1 + 0.7) * Math.PI * 2;
      const sp = speed * (0.7 + rand(i * 9.3 + 1.1) * 0.6); // 0.7×–1.3× base
      balls.push({
        x: rand(i * 1.3 + 0.1) * Math.max(0, W - 2 * r) + r,
        y: rand(i * 2.7 + 0.5) * Math.max(0, maxY - minY) + minY,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        rot: rand(i * 11.7) * 360,
        rotVel: (rand(i * 13.9) - 0.5) * 720, // deg/sec — also bumped for the speed
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
    const minY = getBallTopBoundary(r);
    const maxY = Math.max(minY, H - r);
    const N = balls.length;

    // Substep the physics so a 7200 px/s ball can't tunnel through a
    // 2r-wide neighbor between frames. With 8 substeps each substep
    // moves at most ~15 px, well under one ball radius.
    const SUBSTEPS = 8;
    const sub = dt / SUBSTEPS;
    for (let s = 0; s < SUBSTEPS; s++) {
      // Integrate + bounce off walls
      for (let i = 0; i < N; i++) {
        const b = balls[i];
        b.x += b.vx * sub;
        b.y += b.vy * sub;
        b.rot += b.rotVel * sub;
        if (b.x < r) {
          b.x = r;
          b.vx = Math.abs(b.vx);
          b.rotVel = -b.rotVel;
        } else if (b.x > W - r) {
          b.x = W - r;
          b.vx = -Math.abs(b.vx);
          b.rotVel = -b.rotVel;
        }
        if (b.y < minY) {
          b.y = minY;
          b.vy = Math.abs(b.vy);
          b.rotVel = -b.rotVel;
        } else if (b.y > maxY) {
          b.y = maxY;
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
            a.rotVel += (rand(i * j + 1) - 0.5) * 200;
            c.rotVel -= (rand(i * j + 2) - 0.5) * 200;
          }
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
    updateHeaderClearance();
    const minY = getBallTopBoundary(r);
    const maxY = Math.max(minY, H - r);
    // Clamp positions back inside the new viewport
    for (const b of balls) {
      if (b.x < r) b.x = r;
      if (b.x > W - r) b.x = W - r;
      if (b.y < minY) b.y = minY;
      if (b.y > maxY) b.y = maxY;
    }
  };

  let timers: number[] = [];
  onMounted(() => {
    // Defer physics init one frame so the arena has its measured size.
    requestAnimationFrame(() => {
      updateHeaderClearance();
      initPhysics();
      lastT = 0;
      rafId = requestAnimationFrame(step);
    });
    window.addEventListener('resize', onResize);

    // Stagger each winner reveal by STAGGER_MS so the audience sees them
    // dropped one at a time. Total run time scales with winner count;
    // App.vue waits for the `done` event instead of a fixed 5s timer.
    const FLYING_MS = 4500;
    const STAGGER_MS = 600;
    const POP_MS = 800;
    const TAIL_MS = 1100;

    timers.push(
      window.setTimeout(() => {
        phase.value = 'reveal';
      }, FLYING_MS),
    );
    props.winners.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          playPopSound();
        }, FLYING_MS + i * STAGGER_MS),
      );
    });
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
    activePopPlayers.forEach((player) => {
      player.pause();
      player.src = '';
      player.load();
    });
    activePopPlayers.clear();
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

  /* On reveal, fade balls out at their last physics-set position. We
     don't override transform here — JS keeps whatever it set last so
     the ball doesn't snap to (0,0). */
  .lottery-arena.is-revealing .lottery-ball {
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  .winner-reveal {
    position: absolute;
    top: var(--winner-reveal-top, 0);
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--winner-reveal-gap, clamp(12px, 3vw, 32px));
    padding: var(--winner-reveal-pad-y, 0)
      var(--winner-reveal-pad-x, clamp(12px, 3vw, 40px));
    overflow: hidden;
    pointer-events: none;
  }

  .winner-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--winner-card-gap, clamp(6px, 1.4vh, 14px));
    width: var(--card-w, 200px);
    animation: drop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  }

  .winner-avatar {
    width: var(--winner-avatar-size, clamp(80px, 16vh, 160px));
    height: var(--winner-avatar-size, clamp(80px, 16vh, 160px));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: var(--winner-avatar-font-size, clamp(28px, 5vh, 56px));
    border: var(--winner-avatar-border, 5px) solid #fff;
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
    padding: var(--winner-name-py, 6px) var(--winner-name-px, 22px);
    font-size: var(--winner-name-size, clamp(16px, 2.6vh, 28px));
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
