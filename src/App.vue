<script setup lang="ts">
  import { computed, inject, ref } from 'vue';
  import InitPage from './components/InitPage.vue';
  import LoadingPage from './components/LoadingPage.vue';
  import ResultPage from './components/ResultPage.vue';
  import RecordPage from './components/RecordPage.vue';
  import { xor } from 'lodash-es';
  import Swal from 'sweetalert2';
  import { drawing } from './libs/libs';
  import * as Lockr from 'lockr';

  const loadingPage = ref();
  const pageState = ref<'init' | 'loading' | 'result' | 'record'>('init');
  const awards = ref('');
  const headcount = ref<number | ''>('');
  const nameList = ref<string>('');
  const winners = ref<string[]>([]);
  const nameListArr = computed(() =>
    nameList.value.split('\n').filter((name) => name.trim()),
  );
  const handleStart = async () => {
    if (awards.value === '') {
      Swal.fire({
        icon: 'warning',
        text: '請輸入獎項！',
        confirmButtonColor: '#4E4C4C',
      });
      return;
    }

    if (headcount.value === '') {
      Swal.fire({
        icon: 'warning',
        text: '請輸入人數！',
        confirmButtonColor: '#4E4C4C',
      });
      return;
    }

    if (headcount.value > 10) {
      Swal.fire({
        icon: 'warning',
        text: '抽獎人數最多一次10人',
        confirmButtonColor: '#4E4C4C',
      });
      return;
    }

    if (nameList.value === '' || nameListArr.value.length === 0) {
      Swal.fire({
        icon: 'warning',
        text: '請輸入抽獎者姓名！',
        confirmButtonColor: '#4E4C4C',
      });
      return;
    }

    if (headcount.value > nameListArr.value.length) {
      Swal.fire({
        icon: 'warning',
        text: '抽獎人數不能大於名單數',
        confirmButtonColor: '#4E4C4C',
      });
      return;
    }
    pageState.value = 'loading';
    setTimeout(() => {
      winners.value = drawing(nameListArr.value, +headcount.value);
      pageState.value = 'result';
    }, 5000);
  };

  const handleNext = () => {
    pageState.value = 'init';
    const store = Lockr.get('awardsStore', []);
    store.push({
      awards: awards.value,
      winners: winners.value,
    });
    Lockr.set('awardsStore', store);
    nameList.value = xor(nameListArr.value, winners.value).join('\n');
    winners.value = [];
    awards.value = '';
    headcount.value = '';
  };

  const handleGoRecord = () => {
    pageState.value = 'record';
  };

  const handleBack = () => {
    pageState.value = 'init';
  };
</script>

<template>
  <div class="3xl:mt-5">
    <InitPage
      v-if="pageState == 'init'"
      v-model:awards="awards"
      v-model:headcount="headcount"
      v-model:nameList="nameList"
      @start="handleStart"
      @goRecord="handleGoRecord"
    />
    <LoadingPage ref="loadingPage" v-else-if="pageState == 'loading'" />
    <RecordPage v-else-if="pageState == 'record'" @back="handleBack" />
    <ResultPage :winners="winners" :awards="awards" @next="handleNext" v-else />
  </div>
</template>

<style scoped></style>
