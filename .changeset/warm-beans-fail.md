---
---

不發版：本次只動 devDependencies（ESLint 9 → 10、`@eslint/js`、`typescript-eslint`），
發布出去的套件內容完全沒有改變。

判準：`files` 清單裡的東西一個都沒動。`src/configs/eslint.js` 雖然有出貨、也 import
了 ESLint 生態的套件，但它是在**消費端自己的 dependency tree** 解析的——ark-forge
仍在 ESLint 9，不受本次影響。dist/ 是 rebuild 後內容等價（size-limit 與 smoke:next
都通過）。

留下這個空 changeset 而不是讓 `changeset:check` 紅著，是因為那個 job 要的是一個
**明示的決定**：「這次不需發版」必須被寫出來，不能用沉默表示。
