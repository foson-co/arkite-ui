# DX 稽核報告(2026-08-07)

> 方法:掃描 `~/workspace/work/` 下所有安裝 `@arkite-ui/core` 的消費端專案,
> 蒐集五類證據:wrapper 元件、高頻 props 組合、重複樣板、未使用元件、繞過/hack。
> 產出按證據頻率排序的 1.0 API 修正候選清單(文末)。
>
> 註:報告中提到的 `useServerTable` 於稽核當下尚未發版,已與本報告同一 commit 入庫。

**掃描範圍**:9 個實際安裝 `@arkite-ui/core` 的消費端 —— ark-connect/web、ark-crew/web、ark-finance/frontend、ark-harvest/web、ark-museum/apps/web、ark-museum/apps/field、ark-rendoc-web/web、ark-shield/web、chronoark-one/frontend。其餘專案未偵測到依賴,已排除。

---

## 1. Wrapper 元件 / 繞過元件庫的重造

**最強證據 —— chronoark-one 完全繞開 Drawer/Form/Input/Select/Button 自建 schema-driven 編輯抽屜**
`chronoark-one/frontend/src/components/EditDrawer.tsx`(全 264 行)
用原生 `<div>` + inline z-index/position 重刻了 Drawer 的遮罩與滑出面板,並用 `switch(field.type)` 手刻 text/textarea/date/datetime/number/email/select 六種原生 `<input>/<select>`,完全沒有 import 任何 `@arkite-ui/core` 元件。介面設計成宣告式 `fields: EditField[]`(key/label/type/options/required)—— 這正是一個「泛用 schema 表單」的需求,但函式庫沒有對應的 Form/Drawer 組合可直接滿足,逼得消費端整個重做一遍。

**chronoark-one 自建的頁面骨架元件(補足 AdminLayout 沒提供的 sub-page shell)**
- `chronoark-one/frontend/src/components/PageShell.tsx`:注解明白寫「Table area 的 child 應該用 arkite DataTable + fillHeight 才能讓水平 scrollbar 鎖在 viewport 底邊」—— 要讓 DataTable 在 flex 版面裡正確吃滿高度,需要外部再包一層「h-full flex flex-col」骨架,函式庫本身沒給。
- `chronoark-one/frontend/src/components/FormShell.tsx`:補了「max-width 容器 + PageHeader + overflow-auto scroll」,這是每個 form/settings 頁面都要手動組的樣板。

**ark-connect 兩處各自重寫了一份 Timeline,而非使用函式庫的 `Timeline`**
`ark-connect/web/src/app/(admin)/admin/grants/[id]/page.tsx:75-103` 與 `ark-connect/web/src/app/(admin)/admin/orders/[...slug]/page.tsx:106+`
兩個檔案各自定義本地 `function Timeline({ steps })`,手刻「圓形圖示 + 連接線 + 依 status 換色」。函式庫 `Timeline.tsx` 其實**已支援** `icon` 與 `variant` —— 這不是能力缺口,而是**發現性(discoverability)問題**:兩位工程師各自不知道 arkite 已有 Timeline。

## 2. 高頻 Props 組合(統計)

| 組合 / 模式 | 出現次數 | 涉及專案數 |
|---|---|---|
| `const [page, setPage] = useState(1)`(手動分頁 state) | 26 次 | 6/9 |
| DataTable 旁手動配獨立 `<Pagination>`(不用內建 `page`/`totalRows`) | 6 個檔案 | 2/9 |
| DataTable 的 `totalRows`(伺服器模式開關) | **0 次** | 0/9 |
| DataTable 的 `filters`+`onFilterChange`(受控篩選) | **0 次** | 0/9 |
| `catch(err){ toast.error(`...${getErrorMessage(err)}`) }` | ark-finance 235 次、ark-connect 48 次、ark-harvest 58 次、ark-museum-web 37 次 | 4/9 高頻 |
| `STATUS_LABELS`/`STATUS_STYLE` 手刻 Badge 配色映射 | 38 個檔案 | 9/9 |

代表性檔案:
- `ark-connect/web/src/app/(admin)/admin/users/page.tsx:9-24,86-92` —— 手動 `totalPages = Math.ceil(data.total / data.page_size)`,分頁靠外部 `<Pagination>`;同一公式在 orders/grants/audit 頁逐字複製。
- `ark-museum/apps/web/src/pages/Users.tsx:244-283` —— 自建 `queryKey`/`loadedKey` 狀態機,註解直接寫「照 ItemsTab 模式」,是刻意複製的樣板。

**結論**:DataTable 的伺服器模式 API 在 9 個專案裡**完全沒人用過**;大家不是全載資料前端 filter,就是手刻一套分頁/篩選 state machine 貼在 DataTable 外面。

## 3. 重複樣板

1. **伺服器端表格狀態機(queryKey/loadedKey/reloadTick)**:ark-museum-web 7 個檔案幾乎逐字重複(`ItemsTab.tsx:38-40`、`CollectionTab.tsx:31-34`、`StockSection.tsx`、`MembersCard.tsx`、`MyChanges.tsx:27-29`、`Users.tsx:259-263`、`CollectionItemDetail.tsx`)。
2. **raw `<table>` 取代 DataTable**:ark-finance **51 個檔案**手刻原生 table(全專案 0 次 DataTable import);ark-connect 5 檔、ark-rendoc-web 5 檔、ark-harvest 1 檔。
3. **`toast.error` + `getErrorMessage` 錯誤包裝**:每個 CRUD 動作手寫 `` `XX失敗:${getErrorMessage(err)}` ``,共 283+ 次;「包成 toast 訊息」這步從沒被收斂進 toast API。
4. **Badge 狀態配色映射樣板**:9/9 專案共 38 個檔案各自定義 `{status: {label, variant}}` 映射表。

## 4. 未使用 / 低使用元件(import 統計)

- **完全 0 使用(0/9)**:`CommandPalette`、`Tree`、`TagInput`、`VirtualList`、`BulkActionBar`、`ColorPicker`
- **僅 1/9 使用**:`FilterBar`(母元件)、`TenantSwitcher`、`Timeline`(ark-crew;ark-connect 反而重寫兩份)、`Steps`、`SheetSelect`、`Sparkline`
- **偏低**:`AdminLayout` 僅 3/9(6 個專案自己組 Navbar+Sidebar);`DataTable` 僅 4/9(其餘手刻 table)

## 5. 繞過 / Hack 熱點

**`as any`**:與 arkite-ui 相關者為 **0**(型別層乾淨)。

**最嚴重單一案例 —— 鎖定內部 DOM 的全域 CSS 覆蓋**
`ark-finance/frontend/src/index.css:33-58`:註解原文「rail 的 `<aside aria-label="Primary">` 是 arkite-ui 內部 render 的,無法在 React 層加 className」。消費端被迫用 `aside[aria-label='Primary'] { display: none !important; }` 這種猜測內部結構的脆弱 selector 實作手機版隱藏側欄 —— **AdminLayout 沒有暴露 className 注入點或內建響應式行為**。

**`eslint-disable no-restricted-syntax`(退回原生 HTML)共 49 處**,按原因分類:

| 原因 | 次數 | 代表 |
|---|---|---|
| Button variant 無法表達動態雙態 pill/狀態徽章 | 6 | ark-finance AdminWsLiveSourceDetail.tsx:266 等 |
| Button 不能作「整列/整卡可點」非按鈕語意 | 7 | AdminDomainContext.tsx:46、voip/page.tsx:247 等 |
| Button 不能做表格內 inline 文字連結 | 3 | AdminSecrets.tsx:575 等 |
| 手刻隱藏 `<input type="file">`(FileUpload 存在但沒被用) | 7 | ReferencesEditor.tsx:280、StepUpload.tsx:174 等 |
| 缺 backdrop/overlay primitive | 4 | AdminDataSources.tsx:1410 等 |
| 缺 range slider | 1 | QuantBacktest.tsx:2213 |
| Select 內建 chevron 無法移除 | 1 | LanguageSwitcher.tsx:13 |
| Combobox 無法客製下拉外觀 | 4 | admin/grants/page.tsx:152 等 |
| 缺 PinInput/OTP 輸入 | 3 | register/page.tsx:140 等 |
| 行動端大觸控目標/縮圖包裝鈕 | 6+ | BottomNav.tsx:19、ItemDetail.tsx:399 等 |

---

## 1.0 API 修正候選清單(按證據頻率排序)

1. **DataTable 伺服器模式要更好用、更好被發現**(0/9 使用 vs 26+ 處手刻同功能)——`useServerTable` 已入庫,需寫進 README 首頁範例;並檢討 `totalRows !== undefined` 這種隱性模式開關的心智模型。
2. **輕量 Table 定位**:62 個檔案手刻 `<table>`(ark-finance 51 個)。組合式 `Table` 零件已存在但只有 2/9 在用——補「何時用 DataTable、何時用 Table」的選型文件與範例。
3. **toast 錯誤整合**:283+ 次 `toast.error(getErrorMessage(err))` 樣板 → 提供 `toast.fromError(err, { prefix })` 或 `useApiErrorToast()`,與 `@arkite/utils` 的 `getErrorMessage` 對齊。
4. **Button 三個缺口**:`variant="link"`(inline 文字連結)、狀態 pill 雙態配色、「clickable row/card」模式(`asChild` 或 `Card interactive`)——16+ 處 lint bypass 的來源。
5. **FileUpload 發現性/headless 模式**:元件存在但 7 處仍手刻隱藏 input;確認是否支援自訂觸發器,不支援就補,支援就補文件。
6. **AdminLayout 客製化注入點**:暴露 `railClassName`/`headerClassName` 或內建 `hideRailOnMobile`,消滅鎖內部 DOM 的全域 CSS。
7. **零使用元件盤點**:Timeline/Steps 屬「夠用但沒被發現」→ 加強曝光;CommandPalette/Tree/TagInput/VirtualList/BulkActionBar/ColorPicker 零使用 → 重新檢視需求,必要時下架或改版。
8. **StatusBadge 便利範式**(38 檔重複映射表,優先度較低)。
9. **Select `showChevron`/Combobox 客製 slot**(5 處)。
10. **新元件缺口**:PinInput/OTP(認證流程常見)、Range Slider、通用 Backdrop primitive。

---

## 附錄:零使用元件盤點(2026-08-08 深掃)

第二次掃描聚焦「零 import 的六個元件,消費端是不需要還是手刻了等價物」:

| 元件 | 手刻等價物 | 判定 | 處置建議 |
|---|---|---|---|
| `BulkActionBar` | **6 處**(ark-finance 5 處獨立重寫「已選 N 筆 + 批次按鈕列」) | 發現性問題 | **保留 + 加強曝光**(README 有列但沒人知道) |
| `TagInput` | 5 處弱等價(逗號分隔字串輸入,3 專案) | 迴避元件、用陽春方式打發 | **保留 + 文件示範** |
| `CommandPalette` | 0(cmdk peer 被 4 專案裝而未用) | 真的沒需求 | 1.0 標 **experimental**(API 不凍結),觀察至 1.0+6mo |
| `VirtualList` | 0(有書面決策「分頁可解 1000+,不做虛擬捲動」;**也是唯一沒測試的元件**) | 真的沒需求 | 同上;若補測試成本不願付 → 候選下架 |
| `Tree` | 0(僅 2 處扁平表格單層展開,非樹) | 網域資料全是扁平清單 | 1.0 標 experimental |
| `ColorPicker` | 0 | 無使用者自訂顏色的功能 | 1.0 標 experimental |

**翻案項 — Backdrop/overlay**:初次稽核估 4 處,深掃實際 **19 處、4 個專案**(ark-finance 11、chronoark-one 5、ark-museum 2、ark-rendoc-web 1),含兩處註解明文「arkite-ui 沒 generic Dialog / 無對應元件」。三種形態:自製對話框遮罩、dropdown 的透明點外關閉層、全螢幕看圖 lightbox。**證據強度已超過當初做 PinInput 的門檻,建議升級為「該做」**;同時要查為什麼 Modal/Drawer 沒接住前兩類需求(ark-finance 完全沒 import Modal——可能又是發現性)。

**附帶發現**:cmdk 與 @tanstack/react-virtual 這兩個 optional peer 被 4 個消費端「為滿足 peer 警告而裝、實際零 import」——是 peer deps 瘦身(1.0 清單 ①)的直接證據:元件沒人用,依賴卻在 4 個 lockfile 裡。

---

## 回測(2026-08-12,`./scripts/audit-consumers.sh`)

初次稽核的數字是手工蒐集的,沒有人能重跑、也就沒有人能誠實宣告「修好了」。
本次把方法固定成腳本(同樣九個消費端、同樣 pattern、同樣輸出格式),兩次執行才可比。

| 專案 | 版本 | raw `<table>` | Δ | DataTable | Table | useServerTable | AdminLayout |
|---|---|---|---|---|---|---|---|
| ark-connect/web | 0.12.0 | 5 | 0 | 6 | 0 | 0 | 1 |
| ark-crew/web | 0.12.0 | 0 | — | 2 | 0 | 0 | 1 |
| **ark-finance/frontend** | **0.19.1** | **0** | **−51** | **50** | 4 | 0 | 4 |
| ark-harvest/web | 0.12.0 | 1 | 0 | 12 | 0 | 0 | 2 |
| **ark-museum/apps/web** | **0.19.2** | 0 | — | 9 | 7 | **8** | 1 |
| ark-museum/apps/field | 0.19.2 | 0 | — | 0 | 0 | 0 | 0 |
| ark-rendoc-web/web | 0.10.0 | 5 | 0 | 0 | 0 | 0 | 0 |
| ark-shield/web | 0.12.0 | 0 | — | 0 | 1 | 0 | 2 |
| chronoark-one/frontend | *(舊名 `@arkite/ui`,file: 連結)* | 0 | — | 1 | 0 | 0 | 0 |

**手刻 `<table>` 檔案數:62 → 11。**

### 結論

1. **ark-finance 51 → 0,遷移是真的。** 證據不是推論:`git log -S'<table'` 顯示 2026-08-08(稽核隔天)起一連串 `refactor(ui): … 改用 DataTable`,終於 `83c8ec5 升級 0.16.0,四張熱力圖全部遷移 —— 手刻 table 歸零`。修的是上游(`stickyLead`、`cellClassName`、DESIGN.md 的 Table/DataTable 選型規則),不是在下游寫 workaround。
2. **`useServerTable` 0 → 8 個檔案**(ark-museum/apps/web,直接 import 自 `@arkite-ui/core`)。這是初次稽核裡「0/9 使用 vs 26 處手刻」那一條最刺眼的缺口,現在有真實使用者。
3. **剩下的 11 個手刻 table 全部集中在沒升版的專案**:ark-connect 5(0.12.0)、ark-rendoc-web 5(0.10.0)、ark-harvest 1(0.12.0)。**這不是能力缺口,是版本落後** —— 解法是推升版,不是再加 API。
4. **chronoark-one 已不是本套件的消費端**:package.json 仍指向改名前的 `@arkite/ui` 以 `file:` 連結。之後的稽核樣本數應為 8,不是 9。

### 這次回測「沒有」測到什麼

registry.json 與 `theme apply` 是 2026-08-12 才進 main 的,**尚未發版**,不可能影響上表任何數字。
上面看到的是 2026-08-07 稽核 → 上游修正 → 消費端遷移這個迴圈確實閉合;registry 的效果要等發版且消費端升版後,再跑一次同一支腳本才能宣告。
