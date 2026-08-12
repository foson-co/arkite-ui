# Roadmap — Arkite UI

> **定位：自己的專案用得爽，順便放出去。**
>
> 不主動推廣、不經營社群、不追 star。品質自然會說話，
> 有人用就回應，沒人用也不影響我們自己開發。

---

## 現況快照（2026-08-12）

| 指標 | 數據 |
|------|------|
| 版本 | v0.19.2 已發布；3 個 changeset 待發（registry / theme apply / add） |
| 元件數 | 71 個目錄、184 個元件匯出 |
| 測試 | 97 檔、1381 cases、100% 通過 |
| Stories | 88 檔 + 6 個 recipe（整頁組合） |
| a11y | 零 violation（WCAG AA，CI 強制擋 merge） |
| Bundle | index < 300 KB、motion < 10 KB、tailwind-preset < 10 KB、tokens < 5 KB、theme < 10 KB |
| 對外 entry | 5 個（`.`、`/motion`、`/tailwind`、`/tokens`、`/theme`） |
| CLI | `init`、`add <recipe>`、`theme apply` |
| 消費端 | 8 個實際安裝（chronoark-one 已脫離，仍指改名前的 `@arkite/ui`） |

> 採用數據現況見 [docs/DX_AUDIT.md §回測（2026-08-12）](docs/DX_AUDIT.md)，
> 可用 `./scripts/audit-consumers.sh` 隨時重跑。
>
> （`docs/ADOPTION_REPORT.md` 是 2026-03-24 的舊快照，數字已被上面取代；
> 該檔為本機 only —— `/docs/` 在 .gitignore，只有四份 md 被 force-add 進版控。）

---

## 經營策略：佛系開源

### 為什麼開源？

- **自己跨專案共用**才是主因（ark-crm、ark-harvest、ark-rendoc-web）
- 放在 npm 上自己裝也方便，順便公開而已
- 如果真的有外部使用者，代表元件品質夠好 — 正向循環

### 不做的事

- 不經營 Discord / Slack 社群
- 不寫推廣文章、不投稿技術媒體
- 不做 YouTube / live coding
- 不主動找人貢獻
- 不為了外部需求犧牲內部開發節奏

### 怎樣自然擴散

```
自己專案用 → Storybook 站台公開 → npm 能搜到 → 有人試用
                                                    ↓
                          README 夠清楚 ← 有人提 Issue ← 覺得好用
                                ↓
                          自然口碑（自己都不用推）
```

**關鍵槓桿點：讓「找到 → 試用 → 跑起來」這條路零摩擦。**

---

## Phase 1：放上去（v0.4.0） — ✅ 完成（2026-07-02 對齊）

> 花最少力氣，讓套件在 npm 上能被找到、裝起來能跑。

### 必做（直接受益自己專案）

- [x] 修正 `package.json` metadata（author、description 移除 shadcn/ui）
- [x] 補 `MIGRATION.md` — motion import 路徑 + Radix peer deps 變更
- [x] Chromatic token 設好，CI 視覺回歸跑通（`.gitlab-ci.yml` chromatic job，MR + main 觸發）
- [x] Changesets 首次發布驗證，確認 npm publish 流程正確
- [x] bump v0.4.0 → 後續以 `@arkite-ui/core@0.5.0` 發布 npm public（2026-04-22）

### 順手做（10 分鐘內搞定的事）

- [x] `LICENSE` 確認 copyright 年份 + 組織名稱正確（2026-07-02 修正年份 2024 → 2026）
- [x] `package.json` keywords 補 `radix-ui`、`design-system`（2026-07-02）
- [x] README 頂部加一行 npm badge（`npm version`、`bundle size`）（2026-07-02）

### 不急（有人問再說）

- CODE_OF_CONDUCT、SECURITY.md — 真的有外部貢獻者再補
- Issue / PR template — 自己團隊不需要模板

---

## Phase 2：內部品質鞏固（v0.5.x — 進行中）

> 多個專案都在用了，重點是穩固 API、確保不出事。

### 必做

- [x] Chromatic 視覺回歸常態化 — 每個 MR 跑 snapshot（⚠️ 目前 `--exit-zero-on-changes`，有差異不會擋 merge，要擋需移除該 flag）
- [ ] Dark mode 全元件走查 — 確認所有元件在 dark mode 下正確顯示（工具已備：Theme Playground 有 dark 切換 + 對比度讀數；缺的是 light/dark 並排預覽）
- [x] 元件 API 一致性審查 — 審查報告見 [docs/API_CONSISTENCY.md](docs/API_CONSISTENCY.md)（2026-07-02）；rename 執行歸入 Phase 3 breaking 清理
- [ ] React 19 驗證 — peer deps 已支援 `^19.0.0`，需實際驗證
- [x] 移除業務邏輯滲入 — 刪除 authStore/tenantStore/usePermission/useDataFetch/breadcrumb config（2026-07-02，0.6.0 changeset）

### 值得做但不急

- [x] Sparkline 補 nullable data / `placeholder`（無資料時的虛線 placeholder）— 2026-07-03 完成，ark-finance 可移除 wrapper

- [ ] Bundle size regression 顯示在 MR comment（CI job 已有 size-limit）
- [x] Storybook 部署到公開 URL（GitHub Pages：ui.foson.co）
- [ ] README 的 Quick Start 確保 copy-paste 就能跑（新專案開局時驗證）

### 不做

- Starter template repo（`create-arkite-app`）— 維護成本 > 收益
- TypeDoc API reference 站台 — Storybook autodocs + JSDoc 已經夠用
- 獨立文件站 — Storybook 就是文件站（docs/ 有 Fumadocs 骨架，需求驅動再啟用）

---

## Phase 3：v1.0.0 準備

> 前提條件已達成：3 個專案穩定使用。剩餘條件：API 穩定半年無 breaking change。

### 發版前必須完成

- [ ] API 穩定宣告 — 標記哪些元件 API 已凍結、哪些仍 experimental
- [ ] Breaking change 一次性清理 — props 命名、event handler 風格統一
- [ ] MIGRATION.md 完善 — v0.x → v1.0 升級指南
- [ ] 所有消費端升級驗證 — ark-crm、ark-harvest、ark-rendoc-web 全部跑通

### 大廠 issue 挖礦(2026-08-08,六庫 top-reacted open issues 對照)

> 方法:MUI / AntD / Chakra / Mantine / shadcn / Radix 各抓 reaction 排序前 15 條 open issues,
> 對照我們的現況。reaction 數 = 已驗證的市場需求強度。

**✅ 我們已有、而且是他們的高票許願(行銷彈藥,寫進文章/landing)**

| 他們的許願 | 票數 | 我們 |
|---|---|---|
| shadcn: Multi select | 306 | `Combobox multiple`(shadcn 第一高票,我們內建) |
| MUI: Zero-runtime CSS | 291 | Tailwind v4,本來就零 runtime |
| MUI: Improve Next.js support | 255 | RSC smoke test in CI + server-safe tokens |
| AntD: 表單無障礙(盲人無法使用) | 68+26 | WCAG AA CI 強制 + APG 鍵盤真瀏覽器測試 |
| MUI: cascading/nested menu | 124 | `DropdownMenuSub`(Radix) |
| AntD: prefers-color-scheme 自動暗色 | 36 | token 層自動 |
| shadcn: Stepper | 36 | `Steps` |
| AntD: v5 太慢 | 53 | size-limit 預算 + 無 runtime style 引擎 |

**⬆️ 缺口且被大廠高票驗證(候選排期,依票數)**

- [ ] **Slider / RangeSlider**(MUI 66 + 我們稽核 1 處 + shadcn 生態常見)— 三度出現,從「押後」升級為排期
- [ ] **Timeline horizontal orientation**(MUI 84)— 便宜,`orientation` prop
- [ ] **Combobox 非同步/分頁選項**(MUI 83+103)— 和 useServerTable 同構:`useServerOptions()`?
- [ ] **DataTable 曝露處理後資料**(AntD 61:filter/sort 後的 currentDataSource)— `onDataChange?` 便宜
- [ ] **Table/DataTable 欄寬拖拉調整**(AntD 24;admin 表格經典需求)— 中等工程量
- 🚫 Charts(shadcn 37)— 維持範圍外(用專門庫)

### DX 稽核產出(2026-08,證據見 docs/DX_AUDIT.md)

已完成:

- [x] `useServerTable` hook — 伺服器分頁六件套一次接好(0/9 使用 vs 26 處手刻的解方)
- [x] DESIGN.md Table/DataTable 選型規則 — Table family 獨立條目 + 決策規則(51 檔手刻 table 的根因)
- [x] `TableHead/TableCell stickyLead` — 凍結首欄(金融寬表剛需,真缺口)
- [x] `AdminLayout classNames/hideSidebar/hideNavbar` — 注入點,消滅鎖內部 DOM 的全域 CSS hack
- [x] `llms.txt`/`llms-full.txt` — AI agent 可讀的 API 與設計規則,隨包發佈

待做(按證據頻率):

- [x] `toast.fromError(err, { prefix })` + `toast.configure({ formatError })` — 283+ 次 catch+toast.error 樣板的收斂點(解析留 app 層,一次接線)
- [x] `Button variant="link"` + `Card interactive`(整卡可點,含鍵盤語意)— 16+ 處 lint bypass 的來源
- [x] `AdminLayout bottomNav` slot(fixed + safe-area padding + main 自動讓位)— 配合 hideSidebar='mobile'
- [x] `FileTrigger` — headless 檔案選取觸發器(任意元素開 picker;FileUpload=dropzone、FileUploadButton=按鈕、FileTrigger=headless 三層並列)
- [x] `PinInput`(OTP 驗證碼,含 SMS autofill / 貼上分配 / 鍵盤導航)
- [ ] `Backdrop`/`Lightbox` primitive — 深掃後證據升級:19 處手刻(4 專案)、2 處註解明文點名缺口 → **升級為該做**;連帶查 Modal 為何沒被 ark-finance 採用
- [ ] Range Slider — 證據仍只有 1 處,續押後
- [x] 零使用元件盤點(結論見 docs/DX_AUDIT.md 附錄)— BulkActionBar/TagInput 是發現性問題該救;CommandPalette/VirtualList/Tree/ColorPicker 建議 1.0 標 experimental 不凍結 API,觀察至 1.0+6mo;VirtualList 缺測試,不補則候選下架

### 對標 Fusion Design（2026-08-12）

> 起因：評估 [fusion.design](https://fusion.design)（阿里 @alifd/next + 主題平台 + 物料市場）
> 有哪些可以逐步靠近。

**先講結論**：Fusion 不是「更大的元件庫」，是一條 DPL 生產線平台，解決的是
「幾百個設計師 × 幾百條產品線 × 多品牌一致性」的組織問題。我們是 1 人 × 8 個消費專案 ×
同一個品牌 —— 照抄整條平台會直接壓垮維護量。**可移植的只有三件：主題可產物化、物料可安裝、消費端可自助。**

| 支柱 | Fusion | 我們 | 處置 |
|---|---|---|---|
| 元件庫 | `@alifd/next` ~60 個 + 「業務組件」 | 71 個目錄，admin 場景更聚焦 | 無差距（業務組件違反 Pure UI，不做） |
| 主題 | 線上編輯器 → npm 主題包 | Theme Playground → `arkite.theme.json` → `theme apply` | ✅ 已補齊 |
| 物料市場 | `/mc` block/template + Iceworks 一鍵注入 | `registry.json` + `arkite-ui add` | ✅ 已補齊 |
| 站點（多品牌 fork） | `/sites/new` 線上平台 | 單一 Storybook | 🚫 我們沒有多品牌，建了就是純維護債 |
| 設計工具鏈 | FusionCool、Figma/Sketch 外掛 | `llms.txt` + `registry.json` | 🚫 方向相反：他們 design→code，我們 code-first、上游是 AI agent |
| 治理 | 幫助中心、版本切換 | DESIGN.md + dev guards + a11y CI + Chromatic | 我們反而領先 |

**我們已經贏的地方**（別因為對方是阿里就自我矮化）：a11y WCAG AA 進 CI 強制、零 runtime CSS
（Tailwind v4 vs 他們 SASS 變數覆蓋）、size-limit 預算、視覺回歸、RSC/Next smoke、AI-ready 文件。

**明確不追**：線上平台與帳號系統、Figma/Sketch 外掛、物料「市場」的市集機制（投稿/審核/評分）、
業務組件分類、版本化文件站（1.0 前沒意義）。

**還沒做的**：
- [ ] ark-museum 接上 `arkite.theme.json`（它已手刻一套 brand config → runtime 注入，是唯一真有需求的對象）
- [ ] ark-harvest / ark-rendoc-web 刪掉各自複製的 40 行預設 token（兩份位元組相同，且 dark primary 已 drift 到舊值）
- [ ] 三個落後專案（0.10 / 0.12）升版 —— 剩下 11 個手刻 `<table>` 全在那裡，是版本落後不是能力缺口

### v1.0.0 什麼時候發？

**3 個專案已穩定使用 ✅，等 API 半年沒有 breaking change 即可。**

預估時間線：
- v0.4.0 發布後開始計算 API 穩定期
- 最快 2026 Q4，不趕

---

## Phase 4：如果真的有人用了

> 以下是「被動觸發」的事項 — 不主動規劃，出現訊號時再做。

| 訊號 | 動作 |
|------|------|
| 有人開 Issue 問怎麼用 | 把回答整理進 README FAQ |
| 有人提 PR | 寫個簡單的 CONTRIBUTING 引導（已有），review 合進去 |
| 累計 5+ 外部 Issue | 補 Issue template（bug / feature request） |
| 有人問能不能商用 | 確認 LICENSE (MIT) 夠清楚，README 加一行說明 |
| npm 週下載 > 100 | 考慮補 SECURITY.md、CODE_OF_CONDUCT |
| 有公司正式採用 | 考慮寫一篇 blog post 或 case study |
| 有人要求 Figma 同步 | 評估投入產出比，可能只給 design token JSON |

---

## 版本規劃

| 版本 | 觸發條件 | 內容 |
|------|---------|------|
| **v0.4.0** ✅ | — | metadata 修正 + Chromatic CI + tokens entry point |
| **v0.5.0** ✅ | 2026-04-22 | 改名 `@arkite-ui/core` 發布 npm、rail sidebar、subNav slot |
| **v0.6.1** ✅ | 2026-07-03 | 移除業務邏輯（breadcrumb config、stores、hooks）— breaking（0.6.0 tag 因 CI 故障未發成，由 0.6.1 補發） |
| **v0.7.0** ✅ | 2026-07-03 | prop naming 統一（依 docs/API_CONSISTENCY.md）— 舊名保留為 deprecated 別名，v1.0 移除 |
| **v0.8.0 – v0.19.2** ✅ | 2026-07 ~ 08 | DX 稽核驅動的一連串補洞：`useServerTable`、`stickyLead`、`toast.fromError`、`FileTrigger`、`PinInput`、Tier A 組合守衛、llms.txt |
| **待發（3 changeset）** | — | `registry.json` + llms.txt Recipes、`theme apply` + `/theme` entry、`add <recipe>` |
| **v0.x.x** | 內部專案需求驅動 | 持續迭代，不設時間表 |
| **v1.0.0** | API 穩定半年 + 消費端驗證 | API 凍結、semver 承諾（最快 2026 Q4） |

---

## 不需要做的事（已驗證）

基於 3 個消費端的實際採用審查（2026-03-24），以下確認不需要：

> ⚠️ 2026-08-12 註：前兩條已被 2026-08 的九專案深掃推翻，第三條已實作。
> 三個消費端看不到的東西，九個看得到 —— 這欄的教訓是**「不需要」的結論有樣本數上限**。

- ~~**不需要加新元件**~~ — 已推翻：深掃後 `PinInput`、`FileTrigger` 已入庫，`Backdrop`/`Lightbox` 證據升級為「該做」（19 處手刻、4 專案）
- ~~**不需要 i18n 方案**~~ — 已實作：`LocaleProvider` + `zhTW`，所有內建字串與 aria-label 走 locale
- **不需要加新 Badge variant** — 7 種 variant 足夠覆蓋所有狀態
- **不需要 form state 管理** — layout-only 設計已驗證正確
- **不需要 page-level template** — ListPageTemplate/FormPageTemplate 屬於專案層
- **不需要 formatDate/formatCurrency** — locale 格式是專案層設定

---

## 最小維護清單（每次發版）

做完這 5 件事就可以 publish，不需要更多：

1. `npm test` 全過
2. `npm run build` 成功
3. `npm run size` 沒超標
4. CHANGELOG 有更新
5. Changesets 走完流程

就這樣。其他的都是錦上添花。
