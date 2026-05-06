<template>
  <div class="page">
    <img src="../assets/bg-circle.png" class="bg-circle" />
    <img src="../assets/left.png" class="deco deco-left" />
    <img src="../assets/right.png" class="deco deco-right" />

    <button class="back-btn" @click="$emit('back')">← 返回</button>

    <div class="content">
      <h2 class="title">頭像設定</h2>

      <div class="card">
        <div class="status-row">
          <span class="badge" :class="source === 'custom' ? 'badge-custom' : 'badge-default'">
            {{ source === 'custom' ? '自訂清單' : '預設清單' }}
          </span>
          <span class="count-text">{{ entryCount }} 筆</span>
          <button v-if="source === 'custom'" class="text-btn" @click="handleClear">
            清除自訂
          </button>
        </div>

        <section class="section">
          <div class="section-title">上傳 JSON 檔案</div>
          <label class="upload-zone">
            <span class="upload-arrow">↑</span>
            <span class="upload-label">{{ filename || '點擊選擇 .json 檔案' }}</span>
            <input type="file" accept=".json,application/json" @change="handleFile" hidden />
          </label>
        </section>

        <div class="divider">或</div>

        <section class="section">
          <div class="section-title">從 URL 載入</div>
          <div class="url-row">
            <input
              class="url-input"
              v-model="urlInput"
              placeholder="https://example.com/avatars.json"
              @keydown.enter="handleFetch"
            />
            <button
              class="fetch-btn"
              @click="handleFetch"
              :disabled="loading || !urlInput.trim()"
            >
              {{ loading ? '載入中…' : '載入' }}
            </button>
          </div>
          <div class="hint">目標伺服器需允許跨域（CORS），若失敗請改用上傳檔案方式</div>
        </section>

        <div v-if="message" class="message" :class="messageType">{{ message }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    applyCustomAvatarMap,
    clearCustomAvatarMap,
    getAvatarSource,
    avatarEntryCount,
  } from '../libs/avatar';

  defineEmits(['back']);

  const source = ref(getAvatarSource());
  const filename = ref('');
  const urlInput = ref('');
  const loading = ref(false);
  const message = ref('');
  const messageType = ref<'success' | 'error'>('success');

  const entryCount = computed(() => avatarEntryCount.value);

  const showMsg = (text: string, type: 'success' | 'error') => {
    message.value = text;
    messageType.value = type;
  };

  const validate = (data: unknown): data is Record<string, string> =>
    !!data && typeof data === 'object' && !Array.isArray(data);

  const handleFile = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    filename.value = file.name;
    message.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!validate(data)) throw new Error();
        applyCustomAvatarMap(data as Record<string, string>);
        source.value = 'custom';
        showMsg(`成功載入 ${Object.keys(data).length} 筆頭像資料`, 'success');
      } catch {
        showMsg('JSON 格式錯誤，請確認格式為 { "名字": "圖片URL" }', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleFetch = async () => {
    const url = urlInput.value.trim();
    if (!url || loading.value) return;
    loading.value = true;
    message.value = '';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!validate(data)) throw new Error('格式錯誤');
      applyCustomAvatarMap(data as Record<string, string>);
      source.value = 'custom';
      showMsg(`成功載入 ${Object.keys(data).length} 筆頭像資料`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知錯誤';
      showMsg(`載入失敗：${msg}`, 'error');
    } finally {
      loading.value = false;
    }
  };

  const handleClear = () => {
    clearCustomAvatarMap();
    source.value = 'default';
    filename.value = '';
    urlInput.value = '';
    message.value = '';
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
  }

  .deco {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    max-height: 26vh;
    object-fit: contain;
  }
  .deco-left { left: 2vw; bottom: 4vh; }
  .deco-right { right: 2vw; bottom: 4vh; }

  .back-btn {
    position: absolute;
    z-index: 40;
    left: clamp(12px, 3vw, 40px);
    top: clamp(12px, 3vh, 40px);
    color: #cd0000;
    font-size: clamp(14px, 2vh, 18px);
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
    gap: clamp(12px, 2vh, 20px);
  }

  .title {
    color: #cd0000;
    font-size: clamp(22px, 4vh, 36px);
    font-weight: 800;
    margin: 0;
    letter-spacing: 0.08em;
  }

  .card {
    width: min(580px, 94vw);
    background: #c10d23ef;
    border-radius: clamp(10px, 1.6vh, 16px);
    padding: clamp(16px, 2.6vh, 32px) clamp(18px, 3vw, 40px);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22);
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 2vh, 18px);
    box-sizing: border-box;
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .badge {
    border-radius: 999px;
    padding: 4px 14px;
    font-size: clamp(12px, 1.6vh, 14px);
    font-weight: 700;
  }
  .badge-custom { background: #fff; color: #cd0000; }
  .badge-default { background: rgba(255, 255, 255, 0.25); color: #fff; }

  .count-text {
    flex: 1;
    color: rgba(255, 255, 255, 0.8);
    font-size: clamp(12px, 1.6vh, 14px);
  }

  .text-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 999px;
    padding: 4px 14px;
    font-size: clamp(11px, 1.5vh, 13px);
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    transition: background 0.15s;
  }
  .text-btn:hover { background: rgba(255, 255, 255, 0.15); }

  .section { display: flex; flex-direction: column; gap: 8px; }

  .section-title {
    color: rgba(255, 255, 255, 0.9);
    font-size: clamp(13px, 1.8vh, 15px);
    font-weight: 700;
  }

  .upload-zone {
    display: flex;
    align-items: center;
    gap: 10px;
    height: clamp(44px, 6vh, 54px);
    background: #ffefef;
    border-radius: 999px;
    padding: 0 clamp(14px, 2vw, 24px);
    cursor: pointer;
    font-size: clamp(13px, 1.8vh, 15px);
    color: #4e4c4c;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    transition: background 0.15s;
    overflow: hidden;
    box-sizing: border-box;
  }
  .upload-zone:hover { background: #ffe0e0; }

  .upload-arrow {
    font-size: 1.3em;
    font-weight: 900;
    color: #cd0000;
    flex-shrink: 0;
  }

  .upload-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .divider {
    text-align: center;
    color: rgba(255, 255, 255, 0.55);
    font-size: clamp(12px, 1.6vh, 14px);
    font-weight: 700;
    letter-spacing: 0.2em;
  }

  .url-row {
    display: flex;
    gap: 8px;
  }

  .url-input {
    flex: 1;
    min-width: 0;
    height: clamp(40px, 5.5vh, 50px);
    background: #ffefef;
    border: 0;
    border-radius: 999px;
    padding: 0 clamp(14px, 2vw, 20px);
    font-size: clamp(13px, 1.8vh, 15px);
    color: #000;
    outline: 0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
  }
  .url-input:focus { outline: 2px solid #fff; outline-offset: 2px; }

  .fetch-btn {
    height: clamp(40px, 5.5vh, 50px);
    background: #4e4c4c;
    color: #fff;
    border: 0;
    border-radius: 999px;
    padding: 0 clamp(14px, 2vw, 22px);
    font-size: clamp(13px, 1.8vh, 15px);
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .fetch-btn:hover:not(:disabled) { background: #222; }
  .fetch-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .hint {
    color: rgba(255, 255, 255, 0.55);
    font-size: clamp(11px, 1.4vh, 12px);
    line-height: 1.5;
    padding: 0 4px;
  }

  .message {
    border-radius: clamp(8px, 1.4vh, 12px);
    padding: clamp(8px, 1.4vh, 12px) clamp(12px, 2vw, 18px);
    font-size: clamp(13px, 1.8vh, 15px);
    font-weight: 600;
  }
  .message.success { background: rgba(255, 255, 255, 0.95); color: #2e7d32; }
  .message.error { background: rgba(255, 255, 255, 0.95); color: #c62828; }

  @media (max-width: 768px) {
    .deco { max-height: 14vh; opacity: 0.5; }
  }
  @media (max-width: 480px) {
    .deco { display: none; }
  }
</style>
