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
// Run locally:  SLACK_BOT_TOKEN=xoxb-... node scripts/fetch-slack-avatars.mjs

import fs from 'node:fs/promises';
import path from 'node:path';

const TOKEN = process.env.SLACK_BOT_TOKEN;
const SIZE = process.env.SLACK_AVATAR_SIZE || '192';
const OUTPUT = path.resolve(
  process.env.SLACK_AVATAR_OUTPUT || 'public/slack-avatars.json',
);

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
    const res = await fetch(`https://slack.com/api/users.list?${params}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
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

const main = async () => {
  console.log('Fetching Slack workspace members...');
  const members = await fetchAllUsers();
  console.log(`  ${members.length} members returned`);

  const map = {};
  for (const m of members) {
    if (m.deleted) continue;
    if (m.is_bot) continue;
    if (m.id === 'USLACKBOT') continue;
    const url = pickImage(m.profile);
    if (!url) continue;

    // Index by every name shape the user might paste into the lottery's
    // name list — Chinese real_name, English display_name, handle, etc.
    const keys = new Set(
      [
        m.profile?.real_name,
        m.profile?.real_name_normalized,
        m.profile?.display_name,
        m.profile?.display_name_normalized,
        m.real_name,
        m.name,
      ]
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter(Boolean),
    );

    for (const k of keys) {
      // First writer wins so non-deleted accounts take priority over
      // any later collisions.
      if (!(k in map)) map[k] = url;
    }
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
