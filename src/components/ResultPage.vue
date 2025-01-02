<template>
  <div class="bg">
    <img src="../assets/left.png" class="absolute left-10 bottom-30" />
    <img src="../assets/right.png" class="absolute right-10 bottom-30" />
  </div>
  <div class="relative z-10 h-screen">
    <header class="flex flex-col justify-center items-center gap-5 bg-bg">
      <img src="../assets/awooLogo.svg" alt="awoo logo" class="w-[86px]" />
      <h1
        class="bg-[#FFD7D7] px-15 py-2 text-[48px] leading-[48px] rounded-[100px] shadow-awards font-bold min-w-[400px]"
      >
        {{ awards }}
      </h1>
    </header>

    <div class="w-[1000px] mt-10">
      <div class="text-[#4E4C4C] text-3xl mb-7">
        得獎名單：共{{ winners.length }}位
      </div>
      <div class="min-h-[300px]">
        <div
          :class="`flex items-center justify-center flex-wrap ${
            winners.length < 5 ? 'flex gap-10' : 'grid grid-cols-5 gap-5'
          }`"
        >
          <span
            :class="`bg-secondary-80 ${
              winners.length < 3
                ? 'text-[60px] leading-[95px] min-w-[448px] py-10'
                : 'text-[20px] leading-[32px] min-w-[200px] py-3'
            }  shadow-name rounded-[100px] px-[2px]`"
            v-for="winner in winners"
            :key="winner"
            >{{ winner }}</span
          >
        </div>
      </div>

      <button
        @click="$emit('next')"
        class="mt-5 text-red text-[28px] leading-8 flex items-center justify-center w-full gap-6 font-bold"
      >
        下個獎項<img src="../assets/arrow-right-red.svg" />
      </button>
      <div class="music-player">
        <audio ref="audio" src="./result-music.mp3" autoplay id="audio"></audio>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  export interface IProps {
    winners: string[];
    awards: string;
  }
  defineProps<IProps>();

  defineEmits(['next']);
</script>

<style></style>
