# 前端開發規範 (Vue + PWA)

## 1. 核心目標
建立一個具備 PWA 功能的血壓記錄網頁，提供長輩如原生 App 般的流暢體驗。必須在正式 HTTPS 環境運行以啟用 PWA 特性。

## 2. 技術棧 (Frontend Stack)
- **框架**: Vue 3 (Vite, Composition API)
- **狀態/驗證**: Pinia + Supabase Client
- **圖表**: Chart.js / vue-chartjs
- **PWA**: `vite-plugin-pwa`
- **佈署平台**: **Vercel** (提供正式 HTTPS 網址)

## 3. 使用者體驗與 UI (Elder-Friendly)
- **導覽列 (Navbar)**: 手機版固定於底部，具備「大圖示 + 中文標籤」。
- **字體/按鈕**: 內文 >= 18px，按鈕高度 >= 48px。
- **顏色警示**: 收縮壓 > 140 為紅色，正常為綠色。
- **7-2-2 邏輯**: 自動計算 7 天平均值。

## 4. 安全與憑證 (Credential Concerned)
- **Token 存儲**: JWT 存於 `localStorage` (長輩友善，免重複登入)。
- **API 請求**: 呼叫後端時，Header 必須包含 `Authorization: Bearer <JWT_TOKEN>`。

## 5. 正式佈署與網址規範
- **佈署平台**: 串接 GitHub 並佈署至 **Vercel**。
- **HTTPS 限制**: 必須使用 Vercel 提供的正式網址 (https://...) 以確保 PWA 正常運作。
- **環境變數**: 
    - `VITE_API_URL`: 指向後端 Hugging Face Spaces 或 Render 的正式 API 網址。
    - `VITE_SUPABASE_URL`: 指向正式 Supabase 網址。

## 6. 核心頁面架構
- **登入頁**: 信箱驗證檢查。
- **紀錄/趨勢頁**: 三層結構 (日曆/圖表/當日建議)。
- **分享頁**: 6 碼安全金鑰連結機制。