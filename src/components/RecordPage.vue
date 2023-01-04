<template>
  <div class="bg">
    <img src="../assets/leftRabbit.png" class="absolute left-10 bottom-30" />
    <img src="../assets/rightRabbit.png" class="absolute right-10 bottom-30" />
  </div>
  <div class="relative z-10 h-screen">
    <header class="flex flex-col justify-center items-center gap-5 bg-bg">
      <img src="../assets/awooLogo.svg" alt="awoo logo" class="w-[86px]" />
      <h1
        class="bg-red rounded-full px-15 py-5 text-[50px] leading-[65px] font-bold min-w-[300px]"
      >
        抽獎紀錄
      </h1>
    </header>

    <div class="w-[771px] mt-20">
      <div
        class="h-[400px] bg-[#FFD7D7] rounded-lg p-4 scrollbar-thin scrollbar-thumb-red scrollbar-track-bg scrollbar-thumb-rounded-xl"
      >
        <div
          v-for="(record, index) in records"
          :key="`${record.awards}-${index}`"
          class="grid grid-cols-[auto,1fr] text-left text-gray-900 text-xl border-b border-solid border-red p-2"
        >
          <div class="font-semibold">{{ record.awards }}：</div>
          <div>{{ record.winners.join('、') }}</div>
        </div>
      </div>
      <div class="flex justify-center gap-20">
        <button
          @click="$emit('back')"
          class="mt-5 text-red text-[28px] leading-8 flex items-center justify-center gap-6 font-bold"
        >
          返回
        </button>
        <button
          @click="handleClear"
          class="mt-5 text-black text-[28px] leading-8 flex items-center justify-center gap-6 font-bold"
        >
          清除紀錄
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import * as Lockr from 'lockr';
  import Swal from 'sweetalert2';

  const records = computed(() => {
    return Lockr.get('awardsStore', []);
  });

  const emit = defineEmits<{
    (event: 'back'): void;
  }>();

  const handleClear = () => {
    Swal.fire({
      title: '清除',
      text: '您確定要清除中獎紀錄嗎?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: '清除',
      cancelButtonText: '取消',
      showConfirmButton: true,
      confirmButtonColor: '#D40022',
    }).then((result) => {
      if (result.isConfirmed) {
        Lockr.flush();
        emit('back');
      }
    });
  };
</script>

<style></style>
