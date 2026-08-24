# Migration Guide

## v0.x → v1.0 Codemod

v1.0 移除所有 v0.7 起標記棄用的 API。本 repo 內建 codemod（`src/codemod/`，不進 npm 打包），消費端專案跑一條指令即可完成大部分遷移：

```bash
# 在 arkite-ui repo 根目錄執行，目標指向消費端專案根目錄
pnpm codemod:v1 ~/workspace/work/<專案>            # 直接改檔
pnpm codemod:v1 ~/workspace/work/<專案> --dry-run  # 只列報告與將變更的檔案，不寫檔
```

### 行為

- 優先載入目標的 `tsconfig.json`；找不到（或沒列出任何檔案，如 monorepo 根目錄）時，改掃描整個目標資料夾的 `*.{ts,tsx}`（略過 node_modules / dist / build 等；不限定 `src/`，根目錄 `app/`、`pages/` 的 Next.js 專案也掃得到）。
- **安全第一**：只轉換確定 import 自 `@arkite-ui/core`（或消費端自己 re-export 該名稱的模組）的元件與 API，同名的專案自有元件不會被動到。
- 無法安全自動化的用法會插入 `// TODO(arkite-v1): <說明>` 註解並在報告中計數——**不會用猜的**。
- 結束時印出每條規則的變更數與 TODO 標記數。codemod 可重跑（冪等，TODO 註解不會重複插入）。

### 涵蓋的轉換

| 元件 / API                                  | 轉換                                                                                                                                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Alert`                                     | `variant="error"` → `"destructive"`；`onDismiss` → `onClose`                                                                                                                  |
| `Progress` / `CircularProgress`             | `variant="error"` → `"destructive"`                                                                                                                                           |
| `CircularProgress`                          | `size={數值}` → `diameter={數值}`（`size="sm"⎮"md"⎮"lg"` 不動）                                                                                                               |
| `Tabs`                                      | `onValueChange` → `onChange`                                                                                                                                                  |
| `LoadingOverlay`                            | `visible` → `open`                                                                                                                                                            |
| `Toggle`                                    | → `Switch`（import 與 JSX 一起改；檔內已有 `Switch` 則合併）                                                                                                                  |
| `ImperativeToastContainer(Props)`           | → `ToastContainer(Props)`（import、JSX、型別註記）                                                                                                                            |
| `FormField` / `FormMessage` / `ImageUpload` | `error={字串字面量/模板}` → `errorMessage={同值}`                                                                                                                             |
| `DataTable`                                 | `expandable={函式/識別字}` → `renderExpandedRow={同值}`（布林形式不動）                                                                                                       |
| `Tree`                                      | `onCheckChange` → `onSelectionChange`                                                                                                                                         |
| `Pagination`                                | `mode=` → `variant=`                                                                                                                                                          |
| `Timeline`                                  | 內聯 `items` 陣列字面量中的 `variant: 'default'` → `'muted'`                                                                                                                  |
| `TenantSwitcher`                            | `currentTenant` → `value`；`onSelect` → `onChange`                                                                                                                            |
| toast API                                   | `.clear()` → `.dismissAll()`（含解構）；`toast.success/error/warning/info/show(t, 字串/模板/JSX)` → 第二參數包成 `{ description: ... }`。`toast.error()` 等便捷方法名保留不變 |

### 一律標 TODO（需人工處理）

- `CommandDialog` 的 `onOpenChange`：簽名由 `(open: boolean) => void` 改為 `onClose: () => void`，需手動改寫。
- `error={非字面量表達式}`：可能已是 v1.0 的 boolean 新契約，不動。
- `Timeline items={變數}`：無法檢查變數內容是否含 `variant: 'default'`。
- `CircularProgress size={無法判定型別的表達式}`、`DataTable expandable={無法判定的表達式}`、無法判定的 toast 第二參數。
- 元素上新舊 prop 同時存在（自動改會產生重複 prop）。

### 跑完之後

1. 全域搜尋 `TODO(arkite-v1)`，逐一人工處理後刪除註解。
2. 在目標專案跑 typecheck / lint / prettier（codemod 保留原格式，少數插入處的排版交給 prettier 收尾）。

---

## toast.fromError 採用（選用，非破壞性）

v0.14 起 `toast` 提供 `fromError`，把 `catch` 區塊的錯誤 toast 收斂成一行（title = prefix、解析訊息進 description）。採用分兩步：

**1. app 啟動處註冊解析器（一次）** — 錯誤物件怎麼轉訊息是 app 層知識，元件庫不內建解析：

```ts
import { toast } from '@arkite-ui/core'
import { getErrorMessage } from '@arkite/utils' // 或專案自己的 parser

toast.configure({ formatError: getErrorMessage })
```

**2. 呼叫點改寫** — 手動或跑採用型 codemod（獨立規則集，與 v1.0 破壞性遷移分開）：

```bash
pnpm codemod:from-error ~/workspace/work/<專案>            # 直接改檔
pnpm codemod:from-error ~/workspace/work/<專案> --dry-run  # 只列報告
```

認得的形狀（其他一律不動，不用猜的）：

| Before                                                      | After                                              |
| ----------------------------------------------------------- | -------------------------------------------------- |
| ``toast.error(`儲存失敗：${getErrorMessage(err)}`)``        | `toast.fromError(err, { prefix: '儲存失敗' })`     |
| `toast.error('儲存失敗: ' + getErrorMessage(err))`          | `toast.fromError(err, { prefix: '儲存失敗' })`     |
| `toast.error(getErrorMessage(err))`                         | `toast.fromError(err)`                             |
| ``toast.error(`X:${getErrorMessage(e)}`, { duration: 0 })`` | `toast.fromError(e, { prefix: 'X', duration: 0 })` |

注意：

- 只認 `getErrorMessage` 這個函式名；prefix 尾端的冒號／頓號會自動去掉（prefix 現在是 title，不該帶冒號）。
- 多插值模板、插值後還有文字、第二參數非物件字面量 → 一律跳過，保持原樣。
- 視覺變化：原本一行長字串變成「title + description」兩層，資訊相同、層次更清楚。
- 未註冊 `formatError` 時只有零知識 fallback（`Error#message`、純字串）；解析不出來就只顯示 prefix — `fromError` 不會發明文案。

---

## v0.6.x → v0.7.0

### Prop 命名統一（漸進式，非破壞性）

v0.7.0 統一了 prop 命名慣例（完整審查見 `docs/API_CONSISTENCY.md`）。**所有舊名稱仍可用**，但會在 dev mode 印出 deprecation 警告，並於 **v1.0 移除** —— 請在升級 v1.0 前完成以下取代：

| 元件                                                | 舊                | 新                                              |
| --------------------------------------------------- | ----------------- | ----------------------------------------------- |
| `Alert` / `Progress` / `CircularProgress` / `Toast` | `variant="error"` | `variant="destructive"`                         |
| `Alert`                                             | `onDismiss`       | `onClose`                                       |
| `Tabs`                                              | `onValueChange`   | `onChange`                                      |
| `LoadingOverlay`                                    | `visible`         | `open`                                          |
| `CommandDialog`                                     | `onOpenChange`    | `onClose`                                       |
| `CircularProgress`                                  | `size`（number）  | `diameter`                                      |
| `FormField` / `FormMessage`                         | `error`（string） | `errorMessage`                                  |
| `ImageUpload`                                       | `error`（string） | `errorMessage`（`error` 改為 boolean 狀態旗標） |
| `Toggle`（元件名）                                  | `Toggle`          | `Switch`                                        |

機械式取代範例（各專案可直接跑）：

```bash
# Alert variant（最大宗）
grep -rl 'variant="error"' src | xargs sed -i '' 's/<Alert variant="error"/<Alert variant="destructive"/g'
```

`toast.error(...)` 便捷方法**保留不變**（內部改為產生 destructive variant，外觀不變）。

### 新增（無需遷移）

- `errorMessage?: string`：Checkbox、Radio/RadioGroup、Combobox、DatePicker、DateRangePicker、ColorPicker、TagInput、Switch —— 對齊 Input 家族的 `error` + `errorMessage` 慣例
- `Tree.defaultCheckedKeys`（非受控勾選狀態）
- `ConfirmDialog` / `CommandDialog` 支援 `className`

---

## v0.3.x → v0.4.0

### 1. Motion 元件 import 路徑變更

動畫元件已移至獨立的 `motion` entry point，需要額外安裝 `framer-motion`。

**Before (v0.3.x):**

```tsx
import { AnimatedModal, AnimatedDrawer } from '@arkite-ui/core'
```

**After (v0.4.0+):**

```tsx
import {
  AnimatedModal,
  AnimatedDrawer,
  AnimatedToastContainer,
  useAnimatedToast,
} from '@arkite-ui/core/motion'
```

原因：將 framer-motion 設為 optional peer dependency，讓不需要動畫的專案不需要安裝此套件，減少 bundle size。

---

### 2. 新增 Peer Dependencies

v0.4.0 新增以下 optional peer dependencies，請依照使用的元件安裝：

| 元件                                                        | 需要安裝的套件                         |
| ----------------------------------------------------------- | -------------------------------------- |
| `CommandPalette`                                            | `cmdk@^1.0.0`                          |
| `VirtualList`、`DataTable`（大資料量）                      | `@tanstack/react-virtual@^3.0.0`       |
| `DropdownMenu`                                              | `@radix-ui/react-dropdown-menu@^2.0.0` |
| `Popover`、`DatePicker`、`ColorPicker` 等                   | `@radix-ui/react-popover@^1.0.0`       |
| `Tooltip`                                                   | `@radix-ui/react-tooltip@^1.0.0`       |
| `AnimatedModal`、`AnimatedDrawer`、`AnimatedToastContainer` | `framer-motion@^10 \|\| ^11 \|\| ^12`  |

安裝範例：

```bash
# 安裝全部
pnpm add cmdk @tanstack/react-virtual @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-tooltip framer-motion

# 或只安裝需要的
pnpm add cmdk framer-motion
```

---

### 3. Tailwind CSS v4 必要設定

`@arkite-ui/core` 現在要求 Tailwind CSS v4。若尚未升級：

```bash
pnpm add tailwindcss@^4.0.0 @tailwindcss/vite
```

並在 `tailwind.config` 引入 preset：

```ts
// tailwind.config.ts
import arkitePreset from '@arkite-ui/core/tailwind'

export default {
  presets: [arkitePreset],
}
```

---

### 4. CSS 樣式 import

確保在應用程式入口 import 樣式：

```ts
import '@arkite-ui/core/styles.css'
```

---

## v0.2.x → v0.3.x

### Alert variant 名稱變更

`variant="destructive"` 已重新命名為 `variant="error"`，更語意化。

**Before:**

```tsx
<Alert variant="destructive">...</Alert>
```

**After:**

```tsx
<Alert variant="error">...</Alert>
```
