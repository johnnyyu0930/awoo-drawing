# 阿物尾牙抽獎系統

抽獎網址： https://johnnyyu0930.github.io/awoo-drawing/

## 頭像設定教學

系統支援用 JSON 匯入頭像清單，格式如下：

```json
{
	"王小明": "https://example.com/avatar-1.png",
	"陳小龍": "https://example.com/avatar-2.png"
}
```

注意事項：

1. key 是抽獎名單中的名字，value 是對應的圖片 URL。
2. 如果抽獎名單前面加了請假資訊，例如 `0507下午請假職代小明 陳小龍 - PS SEO`，系統也會嘗試比對名字中的原始姓名來抓頭像。
3. 如果你手上沒有頭像 JSON，可以直接跟 Johnny 索取最新的 `slack-avatars.json`。

匯入方式：

1. 打開首頁後，點右上角的 `頭像設定`。
2. 可直接上傳 `.json` 檔案。
3. 或者貼上 JSON 檔案網址，從 URL 載入。
4. 匯入成功後，抽獎球與中獎卡片就會使用對應頭像。

如果要更新專案預設頭像清單：

1. 將 JSON 放到 `public/slack-avatars.json`。
2. 或設定 `SLACK_BOT_TOKEN` 後執行 `node scripts/fetch-slack-avatars.mjs` 自動產生。
3. `.env.local` 也可放 `SLACK_BOT_TOKEN`，script 會自動讀取。

## 更換標題圖片教學

1. fork 一份到您的帳號
2. 將新的標題圖片放入 `src/assets` 資料夾內
3. 打開 `src/components/InitPage.vue`
4. 找到 `<header class="banner">` 內的 `<img>`，把 `src="../assets/2026_bn.png"` 改成你的新檔名
5. 建議先執行 `pnpm dev` 或 `pnpm build` 確認圖片顯示正常
6. 修改 `package.json` 內的 `version` 升一版
7. 確認變更後 git commit
8. 從 fork 出來的專案提交 Pull Request 到原專案
9. 合併之後等待 GitHub Actions 自動 deploy
10. 如遇到 Action 失敗，請通知工程團隊

補充：

1. 標題圖片目前是首頁最上方 banner，位置在 `src/components/InitPage.vue`。
2. 建議沿用原本圖片比例與版面留白，避免在手機版被裁切。

### 使用 Agent 協助更換標題圖片範例

如果要請 Codex 或 Claude 幫忙改標題圖片，可以直接貼下面這段提示詞。

範例：請 Agent 從頭完成整個標題圖更新流程

```text
請幫我更新首頁標題圖片。
新圖片檔案已經放在 src/assets/2027_bn.png。
請你完成以下事情：
1. 修改 src/components/InitPage.vue 的 banner 圖片路徑。
2. 確認畫面在桌機和手機版不會明顯跑版。
3. 執行 pnpm build 驗證。
4. 幫我確認是否需要同步調整 package.json 的 version。
```
