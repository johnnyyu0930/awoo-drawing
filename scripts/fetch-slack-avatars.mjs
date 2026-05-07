#!/usr/bin/env node
// Fetches Slack workspace member avatars and writes a name -> image-URL
// map to public/slack-avatars.json. The lottery app (LoadingPage) reads
// that file at runtime to show real avatars on each lottery ball.
//
// Required env: SLACK_BOT_TOKEN (xoxb-... with `users:read` scope).
// Optional env:
//   SLACK_AVATAR_SIZE   one of 24,32,48,72,192,512,1024 (default: 192)
//   SLACK_AVATAR_OUTPUT output path (default: public/slack-avatars.json)
//
// The script also loads `.env` and `.env.local` via Vite's env loader.
// Values already present in the shell environment still take precedence.
//
// Run locally:  node scripts/fetch-slack-avatars.mjs

import fs from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');

for (const [key, value] of Object.entries(env)) {
  if (process.env[key] == null) {
    process.env[key] = value;
  }
}

const TOKEN = process.env.SLACK_BOT_TOKEN;
const SIZE = process.env.SLACK_AVATAR_SIZE || '192';
const OUTPUT = path.resolve(
  process.env.SLACK_AVATAR_OUTPUT || 'public/slack-avatars.json',
);

const fetchJson = (url, headers) => {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch(url, { headers }).then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return res.json();
    });
  }

  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      const chunks = [];

      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const status = res.statusCode ?? 0;
        const statusText = res.statusMessage ?? '';
        const body = Buffer.concat(chunks).toString('utf8');

        if (status < 200 || status >= 300) {
          reject(new Error(`HTTP ${status} ${statusText}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
  });
};

if (!TOKEN) {
  console.error('SLACK_BOT_TOKEN env var is required.');
  process.exit(1);
}

const fetchAllUsers = async () => {
  const members = [];
  let cursor = '';
  for (;;) {
    const params = new URLSearchParams({ limit: '200' });
    if (cursor) params.set('cursor', cursor);
    const data = await fetchJson(`https://slack.com/api/users.list?${params}`, {
      Authorization: `Bearer ${TOKEN}`,
    });
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }
    members.push(...(data.members ?? []));
    cursor = data.response_metadata?.next_cursor || '';
    if (!cursor) break;
  }
  return members;
};

const pickImage = (profile) => {
  const key = `image_${SIZE}`;
  return (
    profile?.[key] ||
    profile?.image_192 ||
    profile?.image_512 ||
    profile?.image_72 ||
    profile?.image_original ||
    ''
  );
};

const normalizeName = (value) =>
  typeof value === 'string' ? value.trim() : '';

const BOT_LIKE_MEMBER_PATTERN = /機器人|(?:^|[^a-z])(bot|robot)(?:[^a-z]|$)/i;

const isBotLikeMember = (member) =>
  [
    member.profile?.display_name_normalized,
    member.profile?.display_name,
    member.profile?.real_name_normalized,
    member.profile?.real_name,
    member.real_name,
    member.name,
  ]
    .map(normalizeName)
    .filter(Boolean)
    .some((value) => BOT_LIKE_MEMBER_PATTERN.test(value));

const isActiveMember = (member) =>
  !member.deleted &&
  !member.is_bot &&
  !member.is_invited_user &&
  !member.is_restricted &&
  !member.is_ultra_restricted &&
  member.id !== 'USLACKBOT' &&
  !isBotLikeMember(member);

const pickMemberName = (member) =>
  [
    member.profile?.display_name_normalized,
    member.profile?.display_name,
    member.profile?.real_name_normalized,
    member.profile?.real_name,
    member.real_name,
    member.name,
  ]
    .map(normalizeName)
    .find(Boolean) || '';

const main = async () => {
  console.log('Fetching Slack workspace members...');
  const members = await fetchAllUsers();
  console.log(`  ${members.length} members returned`);

  const map = {};
  const activeMembers = members
    .filter(isActiveMember)
    .sort((a, b) => (a.updated ?? 0) - (b.updated ?? 0));

  for (const m of activeMembers) {
    const url = pickImage(m.profile);
    const name = pickMemberName(m);
    if (!url) continue;
    if (!name) continue;

    // Keep one current name per active member. Because members are sorted by
    // Slack's `updated` timestamp, newer profile data replaces older data.
    map[name] = url;
  }

  const sorted = Object.fromEntries(
    Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'zh-Hant')),
  );

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(sorted, null, 2) + '\n');
  console.log(
    `Wrote ${Object.keys(sorted).length} avatar entries to ${path.relative(
      process.cwd(),
      OUTPUT,
    )}`,
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
