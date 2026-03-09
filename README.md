```markdown
# 📱 VitalGuard Frontend
> **智慧長輩健康守護系統 - 極簡 Vue 3 PWA 介面**

---

## 1. 技術棧 (Frontend Stack)
- **框架**: Vue 3 (Vite + Composition API)
- **狀態管理**: Pinia
- **數據庫與驗證**: Supabase Client
- **圖表庫**: Chart.js + vue-chartjs
- **PWA**: `vite-plugin-pwa` (支援離線記錄與安裝)

## 2. UI/UX 設計規範 (Elder-Friendly)
- **配色**: 正常 (森林綠 #10B981) / 偏高 (警示紅 #EF4444)。
- **操作**: 介面如遙控器般單一路徑，按鈕高度 >= 56px，字體 >= 20px。
- **視覺**: 高對比、大數字，減少視覺負擔。

## 3. 頁面導覽流程
- **🏠 記錄**: 入口即測量，送出後即刻彈出 AI 建議卡片。
- **📈 趨勢**: 
  - 頂層：橫向日期切換條。
  - 中層：Chart.js 趨勢折線圖。
  - 底層：預設顯示「今日」或所選日期的測量結果與 AI 飲食處方。
- **🤝 分享**: 顯示 8 位 Sharing Code，管理家屬綁定清單。
- **👤 會員**: 設定個人生理參數 (身高/體重)，自動同步 BMI 至後端。

## 4. 快速啟動
```bash
# 1. 安裝套件
npm install

# 2. 開啟開發環境
npm run dev

# 3. PWA 預覽測試
npm run build && npm run preview