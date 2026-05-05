// Optional Slack avatar map. Drop a file at `public/slack-avatars.json`
// shaped like `{ "王小明": "https://...jpg", ... }` and matching names will
// render with the real photo. Names not in the map fall back to a
// deterministic gradient + initials avatar.

let avatarMap: Record<string, string> = {};
let mapPromise: Promise<void> | null = null;

export const loadAvatarMap = (): Promise<void> => {
  if (mapPromise) return mapPromise;
  mapPromise = (async () => {
    try {
      const url = `${import.meta.env.BASE_URL}slack-avatars.json`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          avatarMap = data as Record<string, string>;
        }
      }
    } catch {
      // No map file — fallback avatars will be used.
    }
  })();
  return mapPromise;
};

export const getAvatarUrl = (name: string): string | undefined => {
  return avatarMap[name.trim()];
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
