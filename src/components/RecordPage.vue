<template>
  <div class="page">
    <img src="../assets/left.png" class="deco deco-left" />
    <img src="../assets/right.png" class="deco deco-right" />

    <div class="content">
      <header class="record-header">
        <img src="../assets/awooLogo.svg" alt="awoo logo" class="logo" />
        <h1 class="record-title">抽獎紀錄</h1>
      </header>

      <div class="record-list">
        <div
          v-if="records.length === 0"
          class="record-empty"
        >
          目前沒有任何抽獎紀錄
        </div>
        <div
          v-for="(record, index) in records"
          :key="`${record.awards}-${index}`"
          class="record-row"
        >
          <div class="record-award">{{ record.awards }}</div>
          <div class="record-winners">{{ record.winners.join('、') }}</div>
        </div>
      </div>

      <div class="actions">
        <button class="action-btn back" @click="$emit('back')">返回</button>
        <button class="action-btn clear" @click="handleClear">清除紀錄</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import * as Lockr from 'lockr';
  import Swal from 'sweetalert2';

  const records = computed(() => {
    return Lockr.get('awardsStore', []) as {
      awards: string;
      winners: string[];
    }[];
  });

  const emit = defineEmits<{
    (event: 'back'): void;
  }>();

  const handleClear = () => {
    Swal.fire({
      title: '清除',
      text: '您確定要清除中獎紀錄嗎?',
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

<style scoped>
  .page {
    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100svh;
    overflow: hidden;
    color: #222;
  }

  .deco {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    max-height: 24vh;
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
    gap: clamp(10px, 2vh, 20px);
  }

  .record-header {
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
  .record-title {
    background: #cd0000;
    color: #fff;
    border-radius: 999px;
    padding: clamp(8px, 1.5vh, 16px) clamp(24px, 5vw, 60px);
    font-size: clamp(22px, 4vh, 50px);
    font-weight: 800;
    letter-spacing: 0.08em;
    margin: 0;
    box-shadow: inset -2px -4px 0 rgba(0, 0, 0, 0.25);
    min-width: min(280px, 80vw);
    text-align: center;
  }

  .record-list {
    flex: 1 1 auto;
    min-height: 0;
    width: min(800px, 94vw);
    background: #ffd7d7;
    border-radius: clamp(8px, 1.4vh, 12px);
    padding: clamp(10px, 1.6vh, 16px);
    overflow-y: auto;
    box-sizing: border-box;
    box-shadow: 0 12px 30px rgba(205, 0, 0, 0.18);
  }

  .record-empty {
    color: #4e4c4c;
    font-size: clamp(14px, 2vh, 18px);
    padding: clamp(20px, 6vh, 60px) 0;
    text-align: center;
  }

  .record-row {
    display: grid;
    grid-template-columns: minmax(80px, max-content) 1fr;
    gap: clamp(8px, 1.4vw, 16px);
    align-items: baseline;
    text-align: left;
    color: #1a1a1a;
    font-size: clamp(14px, 2vh, 20px);
    border-bottom: 1px solid rgba(205, 0, 0, 0.45);
    padding: clamp(6px, 1vh, 10px) clamp(2px, 0.6vw, 8px);
  }
  .record-row:last-child {
    border-bottom: 0;
  }

  .record-award {
    font-weight: 700;
    color: #cd0000;
  }

  .record-winners {
    word-break: break-word;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: clamp(20px, 6vw, 80px);
    flex-shrink: 0;
  }

  .action-btn {
    background: transparent;
    border: 0;
    font-size: clamp(18px, 2.6vh, 28px);
    font-weight: 800;
    padding: clamp(6px, 1vh, 10px) clamp(12px, 2vw, 20px);
  }
  .action-btn.back {
    color: #cd0000;
  }
  .action-btn.clear {
    color: #1a1a1a;
  }

  @media (max-width: 768px) {
    .deco {
      max-height: 14vh;
      opacity: 0.4;
    }
  }

  @media (max-width: 480px) {
    .deco {
      display: none;
    }
  }
</style>
