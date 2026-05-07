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
        <div :class="['winners-grid', tierClass]">
          <div
            v-for="(winner, i) in winners"
            :key="winner"
            class="winner-card"
            :style="{ animationDelay: i * 0.05 + 's' }"
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

  // Tier picks the grid column count; rows are auto-derived (1fr)
  // so every card occupies the same height regardless of winner count.
  // Tier-1 is the lone "grand prize" case — stacked column layout,
  // everything else is a horizontal avatar+name strip.
  const tierClass = computed(() => {
    const n = props.winners.length;
    if (n <= 1) return 'tier-1';
    if (n === 2) return 'tier-2-feature';
    if (n <= 4) return 'tier-2';
    if (n <= 9) return 'tier-3';
    if (n <= 16) return 'tier-4';
    if (n <= 25) return 'tier-5';
    return 'tier-6';
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
    opacity: 0.5;
  }

  .deco {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    max-height: 18vh;
    object-fit: contain;
    opacity: 0.6;
  }
  .deco-left {
    left: 1vw;
    bottom: 2vh;
  }
  .deco-right {
    right: 1vw;
    bottom: 2vh;
  }

  .content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: clamp(10px, 2.4vh, 24px) clamp(12px, 3vw, 32px);
    box-sizing: border-box;
    gap: clamp(8px, 1.6vh, 18px);
  }

  .result-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(4px, 0.8vh, 12px);
    flex-shrink: 0;
  }

  .logo {
    width: clamp(40px, 6.5vh, 72px);
    height: auto;
  }

  .awards-badge {
    background: linear-gradient(135deg, #ffd7d7 0%, #ffe8e8 100%);
    color: #cd0000;
    padding: clamp(6px, 1.2vh, 14px) clamp(18px, 4vw, 56px);
    border-radius: 999px;
    font-size: clamp(20px, 3.6vh, 42px);
    font-weight: 800;
    letter-spacing: 0.08em;
    margin: 0;
    box-shadow: inset -2px -4px 0 rgba(206, 3, 33, 0.4),
      0 8px 24px rgba(205, 0, 0, 0.18);
    min-width: min(260px, 80vw);
    text-align: center;
  }

  .winners-area {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    max-width: 1400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(6px, 1.2vh, 14px);
  }

  .winners-count {
    color: #4e4c4c;
    font-size: clamp(13px, 2vh, 22px);
    font-weight: 600;
    flex-shrink: 0;
  }

  /* Equal-height rows (1fr) so cards always align in a clean grid even
     when names wrap onto two lines. Padding-block kept small so the
     grid actually fills the available area. */
  .winners-grid {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    display: grid;
    grid-auto-rows: 1fr;
    gap: clamp(6px, 1.2vh, 14px);
    padding: clamp(2px, 0.6vh, 8px);
    box-sizing: border-box;
    overflow-y: auto;
  }

  .tier-1 {
    grid-template-columns: 1fr;
    place-items: center;
  }
  .tier-2-feature {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: center;
    justify-items: center;
  }
  .tier-2 { grid-template-columns: repeat(2, 1fr); }
  .tier-3 { grid-template-columns: repeat(3, 1fr); }
  .tier-4 { grid-template-columns: repeat(4, 1fr); }
  .tier-5 { grid-template-columns: repeat(5, 1fr); }
  .tier-6 { grid-template-columns: repeat(6, 1fr); }

  .winner-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: clamp(6px, 1.2vw, 14px);
    padding: clamp(6px, 1vh, 12px) clamp(8px, 1.4vw, 16px);
    background: rgba(255, 255, 255, 0.92);
    border-radius: clamp(10px, 1.6vh, 18px);
    border: 1px solid rgba(205, 0, 0, 0.18);
    box-shadow: 0 6px 18px rgba(205, 0, 0, 0.16);
    animation: card-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    height: 100%;
    box-sizing: border-box;
    min-width: 0;
    overflow: hidden;
  }

  .winner-avatar {
    flex: 0 0 auto;
    /* viewport-based size — does NOT scale with card height, so the
       avatar stays compact on tall (5×4 grid on 1440p) cards and the
       name pill keeps enough room to render in a single horizontal line. */
    height: clamp(40px, 6vh, 64px);
    width: clamp(40px, 6vh, 64px);
    aspect-ratio: 1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: clamp(11px, 1.8vh, 22px);
    border: clamp(2px, 0.4vh, 4px) solid #fff;
    box-shadow: 0 0 16px rgba(255, 215, 0, 0.55),
      0 4px 12px rgba(205, 0, 0, 0.25),
      inset 0 -6px 12px rgba(0, 0, 0, 0.18),
      inset 0 6px 10px rgba(255, 255, 255, 0.35);
    overflow: hidden;
    animation: glow 1.6s ease-in-out infinite alternate;
  }

  .winner-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Per-tier avatar size — smaller tiers (fewer cards) get bigger avatars. */
  .tier-2 .winner-avatar {
    height: clamp(72px, 12vh, 120px);
    width: clamp(72px, 12vh, 120px);
    font-size: clamp(20px, 3.4vh, 36px);
  }
  .tier-3 .winner-avatar {
    height: clamp(64px, 10vh, 96px);
    width: clamp(64px, 10vh, 96px);
    font-size: clamp(16px, 2.6vh, 28px);
  }
  .tier-4 .winner-avatar {
    height: clamp(56px, 8vh, 80px);
    width: clamp(56px, 8vh, 80px);
    font-size: clamp(14px, 2.2vh, 24px);
  }
  .tier-5 .winner-avatar {
    height: clamp(48px, 6.5vh, 72px);
    width: clamp(48px, 6.5vh, 72px);
    font-size: clamp(12px, 2vh, 22px);
  }
  .tier-6 .winner-avatar {
    height: clamp(40px, 5.5vh, 60px);
    width: clamp(40px, 5.5vh, 60px);
    font-size: clamp(11px, 1.8vh, 18px);
  }

  .winner-name {
    flex: 1 1 0;
    min-width: 0;
    background: #cd0000;
    color: #fff;
    border-radius: 999px;
    padding: clamp(4px, 0.8vh, 10px) clamp(10px, 1.6vw, 22px);
    font-size: clamp(12px, 1.8vh, 22px);
    font-weight: 800;
    letter-spacing: 0.04em;
    box-shadow: inset -2px -3px 0 rgba(0, 0, 0, 0.25),
      0 4px 10px rgba(205, 0, 0, 0.3);
    white-space: normal;
    overflow-wrap: break-word;
    text-align: center;
    line-height: 1.25;
    /* line-clamp: 3 — with the vh-capped avatar the pill is wide
       enough that most names fit on 1–2 lines; 3 is a safety cap
       for runaway strings. */
    display: -webkit-box;
     line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Name font scales with tier — fewer cards per row → bigger text. */
  .tier-2 .winner-name {
    font-size: clamp(20px, 3.2vh, 34px);
    padding: clamp(8px, 1.4vh, 14px) clamp(16px, 2.4vw, 30px);
  }
  .tier-3 .winner-name {
    font-size: clamp(16px, 2.6vh, 28px);
    padding: clamp(6px, 1.2vh, 12px) clamp(14px, 2vw, 24px);
  }
  .tier-4 .winner-name {
    font-size: clamp(14px, 2.2vh, 24px);
  }
  .tier-5 .winner-name {
    font-size: clamp(13px, 2vh, 22px);
  }
  .tier-6 .winner-name {
    font-size: clamp(12px, 1.7vh, 18px);
  }

  /* Single-winner gets the dramatic stacked layout */
  .tier-1 .winner-card {
    flex-direction: column;
    gap: clamp(12px, 2.4vh, 22px);
    padding: clamp(16px, 3vh, 30px);
    width: min(440px, 82vw);
    height: auto;
    align-self: center;
    overflow: visible;
  }
  .tier-2-feature .winner-card {
    flex-direction: column;
    justify-content: center;
    gap: clamp(12px, 2.4vh, 22px);
    padding: clamp(16px, 3vh, 30px);
    width: min(100%, 420px);
    min-height: min(440px, 56vh);
    align-self: center;
    overflow: visible;
  }
  .tier-1 .winner-avatar {
    height: clamp(120px, 26vh, 220px);
    width: clamp(120px, 26vh, 220px);
    aspect-ratio: 1;
    font-size: clamp(40px, 8vh, 72px);
  }
  .tier-2-feature .winner-avatar {
    height: clamp(108px, 20vh, 180px);
    width: clamp(108px, 20vh, 180px);
    aspect-ratio: 1;
    font-size: clamp(34px, 6vh, 60px);
  }
  .tier-1 .winner-name {
    display: block;
    font-size: clamp(20px, 3.6vh, 36px);
    padding: clamp(8px, 1.4vh, 14px) clamp(20px, 3vw, 40px);
    line-height: 1.15;
    width: min(100%, 360px);
    box-sizing: border-box;
    overflow: visible;
    line-clamp: none;
    -webkit-line-clamp: unset;
    -webkit-box-orient: initial;
  }
  .tier-2-feature .winner-name {
    flex: 0 0 auto;
    align-self: center;
    display: block;
    font-size: clamp(20px, 3.2vh, 32px);
    padding: clamp(8px, 1.4vh, 14px) clamp(20px, 3vw, 36px);
    line-height: 1.15;
    width: min(100%, 320px);
    max-width: 100%;
    box-sizing: border-box;
    overflow: visible;
    line-clamp: none;
    -webkit-line-clamp: unset;
    -webkit-box-orient: initial;
  }

  .next-btn {
    flex-shrink: 0;
    color: #cd0000;
    background: transparent;
    border: 0;
    font-size: clamp(16px, 2.4vh, 26px);
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: clamp(4px, 0.8vh, 10px) 24px;
    transition: transform 0.2s ease;
    cursor: pointer;
  }
  .next-btn:hover {
    transform: translateX(4px);
  }
  .next-btn img {
    width: clamp(18px, 2.4vh, 26px);
    height: auto;
  }

  @keyframes card-pop {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.85);
    }
    60% {
      opacity: 1;
      transform: translateY(-3px) scale(1.04);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes glow {
    0% {
      box-shadow: 0 0 14px rgba(255, 215, 0, 0.45),
        0 4px 12px rgba(205, 0, 0, 0.25),
        inset 0 -6px 12px rgba(0, 0, 0, 0.18),
        inset 0 6px 10px rgba(255, 255, 255, 0.35);
    }
    100% {
      box-shadow: 0 0 26px rgba(255, 215, 0, 0.85),
        0 4px 14px rgba(205, 0, 0, 0.4),
        inset 0 -6px 12px rgba(0, 0, 0, 0.18),
        inset 0 6px 10px rgba(255, 255, 255, 0.35);
    }
  }

  /* Tablets / small laptops: drop one column for tier-3+ so cards keep
     enough horizontal room for the name beside the avatar. */
  @media (max-width: 1024px) {
    .tier-4 { grid-template-columns: repeat(3, 1fr); }
    .tier-5 { grid-template-columns: repeat(4, 1fr); }
    .tier-6 { grid-template-columns: repeat(5, 1fr); }
  }

  @media (max-width: 768px) {
    .deco {
      max-height: 12vh;
      opacity: 0.35;
    }
    .tier-2-feature {
      grid-template-columns: 1fr;
    }
    .tier-3 { grid-template-columns: repeat(2, 1fr); }
    .tier-4 { grid-template-columns: repeat(2, 1fr); }
    .tier-5 { grid-template-columns: repeat(3, 1fr); }
    .tier-6 { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 480px) {
    .deco {
      display: none;
    }
    .tier-2-feature .winner-card {
      width: min(100%, 360px);
      min-height: auto;
    }
    .tier-2 { grid-template-columns: 1fr; }
    .tier-3,
    .tier-4 {
      grid-template-columns: repeat(2, 1fr);
    }
    .tier-5,
    .tier-6 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
