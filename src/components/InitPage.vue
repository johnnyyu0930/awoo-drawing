<template>
  <div class="page">
    <img src="../assets/bg-circle.png" class="bg-circle" />
    <img src="../assets/left.png" class="deco deco-left" />
    <img src="../assets/right.png" class="deco deco-right" />

    <button class="settings-btn" @click="$emit('goSettings')">頭像設定</button>
    <button class="record-btn" @click="$emit('goRecord')">抽獎紀錄</button>

    <div class="content">
      <header class="banner">
        <img src="../assets/2026_bn.png" alt="" class="banner-img" />
      </header>

      <div class="form-card">
        <div class="row">
          <input
            class="text-input"
            placeholder="輸入獎項"
            v-model="awards"
          />
          <input
            type="number"
            class="text-input"
            placeholder="輸入人數"
            max="20"
            min="1"
            v-model="headcount"
          />
        </div>

        <div class="namelist-block">
          <div class="namelist-label">
            抽獎人數 {{ nameCount }} 人
          </div>
          <textarea
            class="namelist-input"
            placeholder="請貼上抽獎者名字，以斷行分開"
            v-model="nameList"
          ></textarea>
          <button class="start-btn" @click="emit('start')">
            開始抽獎<img src="../assets/arrow-right.svg" />
          </button>
        </div>
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
    'goSettings',
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
  const nameCount = computed(
    () => props.nameList.split('\n').filter((n) => n.trim()).length,
  );
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
    max-height: 26vh;
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

  .settings-btn {
    position: absolute;
    z-index: 40;
    left: clamp(12px, 3vw, 40px);
    top: clamp(12px, 3vh, 40px);
    color: #cd0000;
    font-size: clamp(14px, 2vh, 20px);
    font-weight: 700;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .record-btn {
    position: absolute;
    z-index: 40;
    right: clamp(12px, 3vw, 40px);
    top: clamp(12px, 3vh, 40px);
    color: #cd0000;
    font-size: clamp(14px, 2vh, 20px);
    font-weight: 700;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: clamp(8px, 2vh, 24px) clamp(12px, 3vw, 32px);
    box-sizing: border-box;
    gap: clamp(8px, 2vh, 20px);
  }

  .banner {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .banner-img {
    width: min(1100px, 92vw);
    max-height: 28vh;
    height: auto;
    object-fit: contain;
    border-radius: clamp(12px, 2vh, 24px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  }

  .form-card {
    width: min(650px, 94vw);
    background: #c10d23ef;
    border-radius: clamp(10px, 1.6vh, 16px);
    padding: clamp(14px, 2.4vh, 30px) clamp(16px, 3vw, 40px);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 1.6vh, 18px);
    max-height: min(560px, 70vh);
  }

  .row {
    display: grid;
    grid-template-columns: 1fr min(180px, 38%);
    gap: clamp(8px, 1.4vw, 18px);
  }

  .text-input {
    background: #ffefef;
    border: 0;
    border-radius: 999px;
    height: clamp(40px, 5.5vh, 51px);
    padding: 0 clamp(14px, 2vw, 24px);
    font-size: clamp(15px, 2vh, 20px);
    color: #000;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    outline: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .text-input:focus {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
  /* hide spin buttons on number input */
  .text-input[type='number']::-webkit-inner-spin-button,
  .text-input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .text-input[type='number'] {
    -moz-appearance: textfield;
  }

  .namelist-block {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 1.4vh, 14px);
    text-align: left;
    min-height: 0;
  }

  .namelist-label {
    color: #fff;
    font-size: clamp(16px, 2.4vh, 22px);
    font-weight: 600;
  }

  .namelist-input {
    width: 100%;
    background: #ffefef;
    border: 0;
    border-radius: clamp(14px, 2vh, 28px);
    padding: clamp(10px, 1.6vh, 14px);
    font-size: clamp(14px, 1.9vh, 18px);
    color: #000;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    outline: 0;
    resize: none;
    min-height: clamp(80px, 18vh, 200px);
    max-height: 28vh;
    box-sizing: border-box;
    font-family: inherit;
  }
  .namelist-input:focus {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  .start-btn {
    background: #4e4c4c;
    color: #fff;
    border: 0;
    border-radius: 999px;
    padding: clamp(10px, 1.6vh, 16px) 0;
    font-size: clamp(18px, 2.6vh, 28px);
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 1.4vw, 18px);
    transition: background 0.2s;
    width: 100%;
  }
  .start-btn:hover {
    background: #222;
  }
  .start-btn img {
    height: clamp(16px, 2.4vh, 24px);
    width: auto;
  }

  @media (max-width: 768px) {
    .deco {
      max-height: 14vh;
      opacity: 0.5;
    }
    .banner-img {
      max-height: 20vh;
    }
  }

  @media (max-width: 480px) {
    .deco {
      display: none;
    }
    .row {
      grid-template-columns: 1fr;
    }
  }

  /* Short-screen laptops (e.g. 1366×768): keep banner small so the
     whole form is reachable above the fold. */
  @media (max-height: 720px) {
    .banner-img {
      max-height: 20vh;
    }
    .form-card {
      max-height: 78vh;
    }
  }
</style>
