<template>
  <div class="page">
    <img src="../assets/bg-circle.png" class="bg-circle" />
    <img src="../assets/left.png" class="deco deco-left" />
    <img src="../assets/right.png" class="deco deco-right" />

    <div class="content">
      <header class="result-header">
        <img src="../assets/awooLogo.svg" alt="awoo logo" class="logo" />
        <h1 class="awards-badge">{{ awards }}</h1>
      </header>

      <div class="winners-area">
        <div class="winners-count">
          得獎名單：共 {{ winners.length }} 位
        </div>
        <div :class="['winners-grid', sizeClass]">
          <div
            v-for="(winner, i) in winners"
            :key="winner"
            class="winner-card"
            :style="{ animationDelay: i * 0.08 + 's' }"
          >
            <div
              class="winner-avatar"
              :style="{ background: getAvatarGradient(winner) }"
            >
              <img
                v-if="getAvatarUrl(winner)"
                :src="getAvatarUrl(winner)"
                :alt="winner"
                @error="onImgError"
              />
              <span v-else>{{ getInitials(winner) }}</span>
            </div>
            <span class="winner-name">{{ winner }}</span>
          </div>
        </div>
      </div>

      <button class="next-btn" @click="$emit('next')">
        下個獎項<img src="../assets/arrow-right-red.svg" />
      </button>
    </div>

    <div class="music-player">
      <audio ref="audio" src="./result-music.mp3" autoplay id="audio"></audio>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import {
    getAvatarGradient,
    getAvatarUrl,
    getInitials,
  } from '../libs/avatar';

  export interface IProps {
    winners: string[];
    awards: string;
  }
  const props = defineProps<IProps>();

  defineEmits(['next']);

  const sizeClass = computed(() => {
    const n = props.winners.length;
    if (n <= 1) return 'size-xl';
    if (n <= 3) return 'size-lg';
    if (n <= 6) return 'size-md';
    if (n <= 12) return 'size-sm';
    return 'size-xs';
  });

  const onImgError = (e: Event) => {
    (e.target as HTMLImageElement).style.display = 'none';
  };
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
    opacity: 0.6;
  }

  .deco {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    max-height: 28vh;
    object-fit: contain;
  }
  .deco-left {
    left: 2vw;
    bottom: 4vh;
  }
  .deco-right {
    right: 2vw;
    bottom: 4vh;
  }

  .content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: clamp(12px, 3vh, 28px) clamp(12px, 3vw, 32px);
    box-sizing: border-box;
    gap: clamp(10px, 2vh, 22px);
  }

  .result-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(6px, 1.2vh, 16px);
    flex-shrink: 0;
  }

  .logo {
    width: clamp(48px, 8vh, 86px);
    height: auto;
  }

  .awards-badge {
    background: linear-gradient(135deg, #ffd7d7 0%, #ffe8e8 100%);
    color: #cd0000;
    padding: clamp(8px, 1.5vh, 16px) clamp(20px, 4vw, 60px);
    border-radius: 999px;
    font-size: clamp(22px, 4.2vh, 48px);
    font-weight: 800;
    letter-spacing: 0.08em;
    margin: 0;
    box-shadow: inset -2px -4px 0 rgba(206, 3, 33, 0.4),
      0 12px 30px rgba(205, 0, 0, 0.18);
    min-width: min(280px, 80vw);
    text-align: center;
  }

  .winners-area {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(10px, 2vh, 24px);
  }

  .winners-count {
    color: #4e4c4c;
    font-size: clamp(14px, 2.4vh, 26px);
    font-weight: 600;
  }

  .winners-grid {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    display: grid;
    place-content: center;
    align-items: start;
    gap: clamp(12px, 2.4vh, 28px);
    padding: clamp(4px, 1vh, 12px);
    overflow: auto;
  }

  /* Tier-based sizing keeps winners filling the visible area without
     scroll for typical 1-12 person draws. */
  .winners-grid.size-xl {
    grid-template-columns: 1fr;
  }
  .winners-grid.size-lg {
    grid-template-columns: repeat(auto-fit, minmax(min(260px, 80vw), 1fr));
  }
  .winners-grid.size-md {
    grid-template-columns: repeat(auto-fit, minmax(min(200px, 40vw), 1fr));
  }
  .winners-grid.size-sm {
    grid-template-columns: repeat(auto-fit, minmax(min(160px, 30vw), 1fr));
  }
  .winners-grid.size-xs {
    grid-template-columns: repeat(auto-fit, minmax(min(120px, 22vw), 1fr));
  }

  .winner-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(6px, 1.2vh, 12px);
    animation: card-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    padding: clamp(6px, 1.2vh, 12px);
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(8px);
    border-radius: clamp(14px, 2vh, 24px);
    border: 1px solid rgba(205, 0, 0, 0.1);
    box-shadow: 0 8px 24px rgba(205, 0, 0, 0.12);
  }

  .winner-avatar {
    --size: var(--avatar-size, 110px);
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: calc(var(--size) * 0.32);
    border: 4px solid #fff;
    box-shadow: 0 0 24px rgba(255, 215, 0, 0.7),
      0 8px 18px rgba(205, 0, 0, 0.3),
      inset 0 -8px 16px rgba(0, 0, 0, 0.18),
      inset 0 8px 14px rgba(255, 255, 255, 0.35);
    overflow: hidden;
    animation: glow 1.6s ease-in-out infinite alternate;
  }

  .winner-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .size-xl .winner-avatar {
    --avatar-size: clamp(140px, 28vh, 240px);
  }
  .size-lg .winner-avatar {
    --avatar-size: clamp(100px, 18vh, 180px);
  }
  .size-md .winner-avatar {
    --avatar-size: clamp(80px, 14vh, 130px);
  }
  .size-sm .winner-avatar {
    --avatar-size: clamp(64px, 10vh, 100px);
  }
  .size-xs .winner-avatar {
    --avatar-size: clamp(48px, 8vh, 80px);
  }

  .winner-name {
    background: #cd0000;
    color: #fff;
    border-radius: 999px;
    padding: clamp(4px, 0.8vh, 10px) clamp(14px, 2.4vw, 26px);
    font-size: clamp(14px, 2.2vh, 22px);
    font-weight: 800;
    letter-spacing: 0.06em;
    box-shadow: inset -2px -3px 0 rgba(0, 0, 0, 0.25),
      0 6px 14px rgba(205, 0, 0, 0.3);
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
    text-align: center;
    line-height: 1.25;
  }

  .size-xl .winner-name {
    font-size: clamp(20px, 4vh, 36px);
    padding: clamp(8px, 1.2vh, 14px) clamp(20px, 3vw, 40px);
  }

  .next-btn {
    flex-shrink: 0;
    color: #cd0000;
    background: transparent;
    border: 0;
    font-size: clamp(18px, 2.6vh, 28px);
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: clamp(6px, 1vh, 12px) 24px;
    transition: transform 0.2s ease;
  }
  .next-btn:hover {
    transform: translateX(4px);
  }
  .next-btn img {
    width: clamp(20px, 2.6vh, 28px);
    height: auto;
  }

  @keyframes card-pop {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.7);
    }
    60% {
      opacity: 1;
      transform: translateY(-4px) scale(1.06);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes glow {
    0% {
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.5),
        0 8px 18px rgba(205, 0, 0, 0.3),
        inset 0 -8px 16px rgba(0, 0, 0, 0.18),
        inset 0 8px 14px rgba(255, 255, 255, 0.35);
    }
    100% {
      box-shadow: 0 0 36px rgba(255, 215, 0, 0.95),
        0 8px 22px rgba(205, 0, 0, 0.45),
        inset 0 -8px 16px rgba(0, 0, 0, 0.18),
        inset 0 8px 14px rgba(255, 255, 255, 0.35);
    }
  }

  @media (max-width: 768px) {
    .deco {
      max-height: 16vh;
      opacity: 0.4;
    }
  }

  @media (max-width: 480px) {
    .deco {
      display: none;
    }
    .winners-grid {
      gap: 12px;
    }
  }
</style>
