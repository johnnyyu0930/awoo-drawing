<template>
  <div class="bg">
    <img
      src="../assets/bg-circle.png"
      class="w-screen h-[95%] fixed bottom-0 left-0 z-0 2xl:bottom-[-5%] 3xl:bottom-[-16%]"
    />
    <img
      src="../assets/coin-bg.png"
      class="pt-[50px] pl-[68px] w-full h-full absolute bottom-0 left-0 z-0 overflow-hidden"
    />
    <img src="../assets/left.png" class="absolute left-10 bottom-30" />
    <img src="../assets/right.png" class="absolute right-10 bottom-30" />

    <button
      class="absolute right-10 top-10 text-red text-xl font-bold"
      @click="$emit('goRecord')"
    >
      抽獎紀錄
    </button>
  </div>
  <div class="relative h-screen z-10 flex flex-col justify-between">
    <header
      class="flex flex-col justify-center items-center pb-2"
    >
    <img src="../assets/title-v10.png" alt="" class="p-5 w-120 bg-bg rounded-3xl shadow-3xl mb-5" />
      <h2 class="text-white text-[72px] leading-[59px] flex items-center gap-5 bg-red">
      </h2>
    </header>

    <div class="w-[552px] pb-8">
      <div class="grid grid-cols-[1fr,200px] gap-5">
        <input
          class="bg-bg rounded-[100px] h-[51px] shadow-sm text-xl text-black px-6 outline-transparent outline-0"
          placeholder="輸入獎項"
          v-model="awards"
        />
        <input
          type="number"
          class="bg-bg border-0 rounded-[100px] h-[51px] shadow-sm text-xl text-black px-6 outline-transparent outline-0 focus:(outline-0 border-0 ring-0)"
          placeholder="輸入人數"
          max="10"
          min="1"
          v-model="headcount"
        />
      </div>
      <div class="text-left mt-5">
        <div class="text-2xl font-semibold">
          抽獎人數 {{ nameList.split('\n').filter((n) => n.trim()).length }} 人
        </div>
        <textarea
          class="w-full mt-2 bg-bg border-0 rounded-[30px] shadow-sm text-xl text-black p-6 outline-transparent outline-0 focus:(outline-0 border-0 ring-0) scrollbar-thin scrollbar-thumb-red scrollbar-track-bg scrollbar-thumb-rounded-xl"
          placeholder="請貼上抽獎者名字，以斷行分開"
          rows="10"
          v-model="nameList"
        ></textarea>
        <button
          @click="emit('start')"
          class="mt-5 flex items-center justify-center gap-5 w-full bg-secondary-80 text-[28px] leading-8 py-4 rounded-[100px] hover:bg-secondary-100"
        >
          開始抽獎<img src="../assets/arrow-right.svg" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  export interface IProps {
    awards: string;
    headcount: number | '';
    nameList: string;
  }
  const props = defineProps<IProps>();
  const emit = defineEmits([
    'update:awards',
    'update:headcount',
    'update:nameList',
    'start',
    'goRecord',
  ]);
  const awards = computed({
    get() {
      return props.awards;
    },
    set(awards) {
      emit('update:awards', awards);
    },
  });
  const headcount = computed({
    get() {
      return props.headcount;
    },
    set(headcount) {
      emit('update:headcount', headcount);
    },
  });

  const nameList = computed({
    get() {
      return props.nameList;
    },
    set(nameList) {
      emit('update:nameList', nameList);
    },
  });
</script>

<style></style>
