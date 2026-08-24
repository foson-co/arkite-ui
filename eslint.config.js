import { createEslintConfig } from './src/configs/eslint.js'

export default createEslintConfig({
  ignores: ['dist/', 'storybook-static/', 'node_modules/', '*.config.*'],
  extraRules: {
    // 命名遮蔽防護（no-restricted-syntax）在**本 repo 內不成立**。
    // 那條規則的前提寫在 src/configs/eslint.js：「consumer 自己宣告了 Modal，
    // 同檔從此 import 不到 core 的 Modal，於是整個機制被重刻」。
    // 我們**就是 core**——`export function Toast()` 是那個 export 的定義本身，
    // 不是遮蔽它；Storybook 的 `export const Card: StoryFn` 也只是 story 名。
    // 規則本身對 consumer 照常生效，這裡只關掉定義端的自我命中。
    'no-restricted-syntax': 'off',
  },
})
