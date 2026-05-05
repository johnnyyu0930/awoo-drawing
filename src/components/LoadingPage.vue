<template>
  <div class="bg">
    <img
      src="../assets/bg-circle.png"
      class="w-full fixed bottom-0 left-0 z-0 2xl:bottom-[-5%] 3xl:bottom-[-20%]"
    />
    <img
      src="../assets/coin-bg.png"
      class="pt-[50px] pl-[68px] w-full h-full absolute bottom-0 left-0 z-0 overflow-hidden"
    />
    <img src="../assets/left.png" class="absolute left-10 bottom-30" />
    <img src="../assets/right.png" class="absolute right-10 bottom-30" />
  </div>
  <div class="relative z-10">
    <header class="flex flex-col justify-center items-center gap-5">
      <img src="../assets/awooLogo.svg" alt="awoo logo" class="w-[86px]" />
      <h1 class="font-extrabold text-6xl text-red tracking-[0.15em]">
        阿物科技前進高雄
      </h1>
    </header>

    <div
      :class="['lottery-arena', phase === 'reveal' ? 'is-revealing' : '']"
      :style="{ '--ball-size': ballSize + 'px' }"
    >
      <div
        v-for="ball in balls"
        :key="ball.name"
        :class="['lottery-ball', ball.isWinner ? 'is-candidate' : '']"
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
          :style="{ animationDelay: i * 0.12 + 's' }"
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

  // deterministic pseudo-random so layout stays stable per render
  const rand = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };

  const ballSize = computed(() => {
    const n = props.nameList.length;
    if (n <= 20) return 96;
    if (n <= 40) return 80;
    if (n <= 80) return 64;
    return 52;
  });

  const winnerSet = computed(() => new Set(props.winners));

  const balls = computed(() =>
    props.nameList.map((name, i) => {
      const startX = rand(i * 1.3 + 0.1) * 86 + 2; // 2%–88%
      const startY = rand(i * 2.7 + 0.5) * 78 + 4; // 4%–82%
      const animIdx = (i % 5) + 1;
      const duration = 5 + rand(i * 3.1 + 1.4) * 4; // 5–9s
      const delay = -rand(i * 4.2 + 2.1) * 6; // -6–0s (desync)
      const spinDir = i % 2 === 0 ? '' : 'reverse';
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
  .lottery-arena {
    position: relative;
    width: min(1200px, 92vw);
    height: 600px;
    margin: 60px auto 0;
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
    animation-timing-function: ease-in-out;
    will-change: transform, opacity;
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
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
    padding: 2px 12px;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    max-width: 160px;
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
    gap: 32px;
    padding: 0 40px;
    pointer-events: none;
  }

  .winner-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    animation: pop-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  }

  .winner-avatar {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 56px;
    border: 6px solid #fff;
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
    padding: 8px 28px;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 0.08em;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @keyframes float1 {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(120px, -90px) rotate(8deg);
    }
    50% {
      transform: translate(-80px, 110px) rotate(-6deg);
    }
    75% {
      transform: translate(-140px, -50px) rotate(10deg);
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
  }
  @keyframes float2 {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    33% {
      transform: translate(-150px, 70px) rotate(-12deg);
    }
    66% {
      transform: translate(110px, -120px) rotate(8deg);
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
  }
  @keyframes float3 {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    20% {
      transform: translate(80px, 110px) rotate(6deg);
    }
    40% {
      transform: translate(160px, -60px) rotate(-8deg);
    }
    60% {
      transform: translate(-90px, -130px) rotate(12deg);
    }
    80% {
      transform: translate(-130px, 60px) rotate(-6deg);
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
  }
  @keyframes float4 {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(-100px, -120px) rotate(-10deg);
    }
    50% {
      transform: translate(140px, -40px) rotate(8deg);
    }
    75% {
      transform: translate(60px, 130px) rotate(-12deg);
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
  }
  @keyframes float5 {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    16% {
      transform: translate(90px, -70px) rotate(8deg);
    }
    33% {
      transform: translate(-130px, -90px) rotate(-10deg);
    }
    50% {
      transform: translate(150px, 80px) rotate(12deg);
    }
    66% {
      transform: translate(50px, 140px) rotate(-6deg);
    }
    83% {
      transform: translate(-110px, 50px) rotate(8deg);
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
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
</style>
