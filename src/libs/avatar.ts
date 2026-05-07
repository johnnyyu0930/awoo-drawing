// Optional Slack avatar map. Drop a file at `public/slack-avatars.json`
// shaped like `{ "王小明": "https://...jpg", ... }` and matching names will
// render with the real photo. Names not in the map fall back to a
// deterministic gradient + initials avatar.
//
// A custom map uploaded via the settings page takes priority and is stored
// in localStorage under STORAGE_KEY.

import { ref, computed } from 'vue';

const STORAGE_KEY = 'avatarMapCustom';

const avatarMap = ref<Record<string, string>>({});
const shortIndex: Record<string, string> = {};
const normalizedIndex: Record<string, string> = {};
const normalizedEntries: Array<{ normalized: string; url: string }> = [];

let mapPromise: Promise<void> | null = null;

const normalizeName = (s: string): string => s.replace(/[\s　]+/g, '').toLowerCase();

// Extract leading CJK characters (Chinese / Japanese kana/kanji) from a key.
const cjkPrefix = (s: string): string => {
  const m = s.match(/^[　-鿿＀-￯]+/);
  return m ? m[0] : '';
};

const applyData = (data: Record<string, string>) => {
  for (const key of Object.keys(shortIndex)) delete shortIndex[key];
  for (const key of Object.keys(normalizedIndex)) delete normalizedIndex[key];
  normalizedEntries.length = 0;
  avatarMap.value = data;
  for (const [k, v] of Object.entries(data)) {
    const prefix = cjkPrefix(k);
    if (prefix && !(prefix in shortIndex)) shortIndex[prefix] = v;

    const normalized = normalizeName(k);
    if (normalized && !(normalized in normalizedIndex)) {
      normalizedIndex[normalized] = v;
    }
    if (normalized) normalizedEntries.push({ normalized, url: v });
  }
};

export const loadAvatarMap = (): Promise<void> => {
  if (mapPromise) return mapPromise;
  mapPromise = (async () => {
    try {
      // Custom map from settings page takes priority over the public file.
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          applyData(parsed as Record<string, string>);
          return;
        }
      }
      const url = `${import.meta.env.BASE_URL}slack-avatars.json`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          applyData(data as Record<string, string>);
        }
      }
    } catch {
      // No map file — fallback avatars will be used.
    }
  })();
  return mapPromise;
};

export const applyCustomAvatarMap = (data: Record<string, string>): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  applyData(data);
};

export const clearCustomAvatarMap = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  applyData({});
  mapPromise = null;
  loadAvatarMap();
};

export const getAvatarSource = (): 'custom' | 'default' =>
  localStorage.getItem(STORAGE_KEY) !== null ? 'custom' : 'default';

export const avatarEntryCount = computed(() => Object.keys(avatarMap.value).length);

export const getAvatarUrl = (name: string): string | undefined => {
  const t = name.trim();
  const normalized = normalizeName(t);
  const fuzzyMatch =
    normalized.length >= 3
      ? normalizedEntries
          .filter(
            ({ normalized: candidate }) =>
              candidate.includes(normalized) || normalized.includes(candidate),
          )
          .sort((a, b) => b.normalized.length - a.normalized.length)[0]?.url
      : undefined;

  return (
    avatarMap.value[t] ??
    normalizedIndex[normalized] ??
    fuzzyMatch ??
    shortIndex[cjkPrefix(t)] ??
    undefined
  );
};

const PALETTE: [string, string][] = [
  ['#FF6B6B', '#FFA94D'],
  ['#4ECDC4', '#1A8FE3'],
  ['#FFD93D', '#FF8E3C'],
  ['#A78BFA', '#7C3AED'],
  ['#FCAEAE', '#CD0000'],
  ['#A8E6CF', '#3E8E7E'],
  ['#FFAAA5', '#D87093'],
  ['#B5EAD7', '#5BC0BE'],
  ['#FBC4AB', '#F08A5D'],
  ['#C5A3FF', '#6A4C93'],
];

const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

export const getAvatarGradient = (name: string): string => {
  const [c1, c2] = PALETTE[hash(name) % PALETTE.length];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
};

export const getInitials = (name: string): string => {
  const t = name.trim();
  if (!t) return '?';
  if (/[一-龥]/.test(t)) {
    return t.length > 2 ? t.slice(-2) : t;
  }
  return t
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
};
