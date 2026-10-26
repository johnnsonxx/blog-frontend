# Blog Frontend

Vue 3 + Vite 的部落格前端，提供登入、文章列表與文章詳情頁。

## 啟動方式

先啟動後端（預設 `http://localhost:5256`），再執行：

```bash
npm install
npm run dev
```

開啟 `http://localhost:5173`。

開發環境由 Vite 將 `/api` 代理到後端，因此不需要額外設定 CORS。正式環境建議由反向代理讓前後端共用網域；若前後端不同網域，後端需先允許前端來源，再於 `.env` 設定：

```bash
VITE_API_BASE_URL=https://your-api.example.com/api
```
