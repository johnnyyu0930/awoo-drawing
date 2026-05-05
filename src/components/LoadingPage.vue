<template>
  <div class="page">
    <img
      src="../assets/bg-circle.png"
      class="bg-circle"
    />
    <img src="../assets/left.png" class="deco deco-left" />
    <img src="../assets/right.png" class="deco deco-right" />

    <div class="content">
      <header class="loading-header">
        <img src="../assets/awooLogo.svg" alt="awoo logo" class="logo" />
        <h1 class="title">阿物科技前進高雄</h1>
      </header>

      <div
        :class="['lottery-arena', phase === 'reveal' ? 'is-revealing' : '']"
        :style="{ '--ball-size': ballSize + 'px' }"
      >
        <div
          v-for="ball in balls"
          :key="ball.name"
          class="lottery-ball"
          :style="ball.style"
        >
          <div class="ball-avatar" :style="{ background: ball.gradient }">
            <img
              v-if="ball.avatarUrl"
              :src="ball.avatarUrl"
              :alt="ball.name"
              @error="ball.avatarUrl = ''"
            />
            <span v-else>{{ ball.initials }}</span>
          </div>
          <span class="ball-name">{{ ball.name }}</span>
        </div>

        <div class="winner-reveal" v-if="phase === 'reveal'">
          <div
            v-for="(winner, i) in winners"
            :key="winner"
            class="winner-card"
            :style="{
              animationDelay: i * 0.12 + 's',
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
    </div>

    <div class="music-player">
      <audio ref="audio" src="./loading-music.mp3" autoplay id="audio"></audio>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue';
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

  const phase = ref<'flying' | 'reveal'>('flying');

  const rand = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };

  const ballSize = computed(() => {
    const n = props.nameList.length;
    if (n <= 12) return 96;
    if (n <= 24) return 80;
    if (n <= 48) return 64;
    if (n <= 80) return 52;
    return 44;
  });

  const winnerCardWidth = computed(() => {
    const n = props.winners.length;
    if (n <= 1) return 'min(360px, 80vw)';
    if (n <= 3) return 'min(260px, 40vw)';
    if (n <= 6) return 'min(200px, 30vw)';
    return 'min(160px, 22vw)';
  });

  const winnerSet = computed(() => new Set(props.winners));

  const balls = computed(() =>
    props.nameList.map((name, i) => {
      const startX = rand(i * 1.3 + 0.1) * 84 + 3; // 3%–87%
      const startY = rand(i * 2.7 + 0.5) * 76 + 5; // 5%–81%
      const animIdx = (i % 6) + 1;
      const duration = 4 + rand(i * 3.1 + 1.4) * 4; // 4–8s
      const delay = -rand(i * 4.2 + 2.1) * 6; // -6–0s
      const spinDir = i % 3 === 0 ? 'reverse' : 'normal';
      return {
        name,
        avatarUrl: getAvatarUrl(name) ?? '',
        gradient: getAvatarGradient(name),
        initials: getInitials(name),
        isWinner: winnerSet.value.has(name),
        style: {
          left: `${startX}%`,
          top: `${startY}%`,
          animationName: `float${animIdx}`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          animationDirection: spinDir,
        },
      };
    }),
  );

  let revealTimer: number | undefined;
  onMounted(() => {
    revealTimer = window.setTimeout(() => {
      phase.value = 'reveal';
    }, 3800);
  });
  onUnmounted(() => {
    if (revealTimer) clearTimeout(revealTimer);
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

  .content {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-rows: auto 1fr;
    justify-items: center;
    width: 100%;
    height: 100%;
    padding: clamp(12px, 3vh, 32px) clamp(12px, 3vw, 32px);
    box-sizing: border-box;
    gap: clamp(12px, 3vh, 28px);
  }

  .loading-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(6px, 1.2vh, 14px);
  }
  .logo {
    width: clamp(48px, 8vh, 86px);
    height: auto;
  }
  .title {
    font-weight: 800;
    font-size: clamp(24px, 5vw, 60px);
    line-height: 1.1;
    letter-spacing: 0.15em;
    color: #cd0000;
    margin: 0;
    text-align: center;
  }

  .lottery-arena {
    position: relative;
    width: 100%;
    height: 100%;
    /* defensive — guarantees absolute-positioned balls have a non-zero
       containing block even if a browser collapses the grid track. */
    min-height: 240px;
    max-width: 1400px;
    overflow: visible;
  }

  .lottery-ball {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transform: translate(0, 0);
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(0.45, 0.05, 0.55, 0.95);
    will-change: transform, opacity;
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    pointer-events: none;
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

  .lottery-arena.is-revealing .lottery-ball {
    opacity: 0;
    transform: scale(0.4);
    animation-play-state: paused;
  }

  .winner-reveal {
    position: absolute;
    inset: 0;
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
    animation: pop-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Chaotic flight paths — translate uses vw/vh so the spread scales
     with viewport (small screens get smaller jumps automatically). */
  @keyframes float1 {
    0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
    14%  { transform: translate(7vw, -8vh) rotate(35deg) scale(1.04); }
    28%  { transform: translate(-5vw, -11vh) rotate(-25deg) scale(0.96); }
    42%  { transform: translate(9vw, 4vh) rotate(50deg) scale(1.06); }
    57%  { transform: translate(-8vw, 9vh) rotate(-40deg) scale(0.94); }
    71%  { transform: translate(5vw, -5vh) rotate(20deg) scale(1.02); }
    85%  { transform: translate(-3vw, 10vh) rotate(-15deg) scale(0.98); }
    100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  }
  @keyframes float2 {
    0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
    16%  { transform: translate(-6vw, 7vh) rotate(-30deg) scale(0.95); }
    33%  { transform: translate(8vw, -9vh) rotate(45deg) scale(1.05); }
    50%  { transform: translate(-9vw, -5vh) rotate(-50deg) scale(0.92); }
    66%  { transform: translate(6vw, 10vh) rotate(25deg) scale(1.06); }
    83%  { transform: translate(-4vw, -8vh) rotate(-20deg) scale(1); }
    100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  }
  @keyframes float3 {
    0%   { transform: translate(0, 0) rotate(0deg); }
    12%  { transform: translate(5vw, 8vh) rotate(20deg) scale(1.03); }
    25%  { transform: translate(-7vw, 11vh) rotate(-30deg) scale(0.97); }
    37%  { transform: translate(10vw, -4vh) rotate(40deg) scale(1.05); }
    50%  { transform: translate(-6vw, -10vh) rotate(-50deg) scale(0.93); }
    62%  { transform: translate(8vw, 6vh) rotate(25deg) scale(1.04); }
    75%  { transform: translate(-9vw, -3vh) rotate(-35deg) scale(0.96); }
    87%  { transform: translate(4vw, 9vh) rotate(15deg) scale(1.02); }
    100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  }
  @keyframes float4 {
    0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
    20%  { transform: translate(-7vw, -9vh) rotate(-40deg) scale(1.05); }
    40%  { transform: translate(9vw, -3vh) rotate(30deg) scale(0.95); }
    60%  { transform: translate(4vw, 11vh) rotate(-25deg) scale(1.07); }
    80%  { transform: translate(-8vw, 5vh) rotate(50deg) scale(0.94); }
    100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  }
  @keyframes float5 {
    0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
    11%  { transform: translate(6vw, -5vh) rotate(25deg) scale(1.04); }
    22%  { transform: translate(-8vw, -7vh) rotate(-35deg) scale(0.94); }
    33%  { transform: translate(10vw, 6vh) rotate(45deg) scale(1.06); }
    44%  { transform: translate(-5vw, 11vh) rotate(-20deg) scale(0.97); }
    55%  { transform: translate(7vw, -10vh) rotate(40deg) scale(1.05); }
    66%  { transform: translate(-10vw, 4vh) rotate(-30deg) scale(0.93); }
    77%  { transform: translate(3vw, 9vh) rotate(15deg) scale(1.02); }
    88%  { transform: translate(-6vw, -3vh) rotate(-25deg) scale(0.99); }
    100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  }
  @keyframes float6 {
    0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
    18%  { transform: translate(-9vw, 4vh) rotate(-45deg) scale(1.05); }
    36%  { transform: translate(5vw, -10vh) rotate(35deg) scale(0.94); }
    54%  { transform: translate(-3vw, 11vh) rotate(-30deg) scale(1.06); }
    72%  { transform: translate(8vw, 3vh) rotate(50deg) scale(0.95); }
    90%  { transform: translate(-6vw, -8vh) rotate(-15deg) scale(1.02); }
    100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  }

  @keyframes pop-in {
    0% {
      opacity: 0;
      transform: scale(0.2) rotate(-20deg);
    }
    60% {
      opacity: 1;
      transform: scale(1.15) rotate(6deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0);
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
