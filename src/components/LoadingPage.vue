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
    <header class="flex flex-col justify-center items-center gap-5 bg-bg">
      <img src="../assets/awooLogo.svg" alt="awoo logo" class="w-[86px]" />
      <h1 class="font-extrabold text-6xl text-red tracking-[0.15em]">
        阿物科技前進高雄
      </h1>
      <h2 class="text-red text-[50px] leading-[59px] flex items-center gap-5">
        <span
          class="w-[53px] h-[53px] border-2 border-solid border-red block rounded-full"
        >
          <img src="../assets/star-o.svg" alt="" class="w-[53px]" />
        </span>
        歡樂 awoo 咚咚龍咚鏘
        <span
          class="w-[53px] h-[53px] border-2 border-solid border-red block rounded-full"
        >
          <img src="../assets/star-o.svg" alt="" class="w-[53px]" />
        </span>
      </h2>
    </header>

    <div class="mt-[150px] 3xl:mt-[120px] max-w-[552px]">
      <img src="../assets/loading.webp" className="w-screen" />
      <div class="music-player">
        <audio
          ref="audio"
          src="./loading-music.mp3"
          autoplay
          id="audio"
        ></audio>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style></style>
