# 🏠 多甘特圖首頁系統

## 📋 概述

升級後的甘特圖應用現在支持多個獨立的項目，每個項目有自己的任務列表和配置。用戶進入首頁時看到所有可用項目的卡片，點擊即可進入詳細甘特圖頁面。

---

## 🎯 新架構

### 文件結構
```
/
├── index.html           ✅ 首頁 - 項目列表
├── gantt.html          ✅ 詳細頁 - 甘特圖和任務管理
├── home.js             ✅ 首頁邏輯
├── app.js              ✅ 甘特圖邏輯（支持項目 ID）
├── styles.css          ✅ 通用樣式
├── CHECK.html          ✅ 診斷工具
└── 文檔
    ├── COLOR_UPDATES.md
    ├── TITLE_API.md
    └── UPDATES.md
```

### URL 映射

| 頁面 | URL | 說明 |
|------|------|------|
| 首頁 | `http://localhost:8000/` | 項目列表 |
| 英文課程 | `http://localhost:8000/gantt.html?id=english-q2q4` | 英文進度追蹤 |
| 數學課程 | `http://localhost:8000/gantt.html?id=math-courses` | 數學教學計劃 |
| 設計系統 | `http://localhost:8000/gantt.html?id=design-system` | 設計系統建置 |
| 軟體生命週期 | `http://localhost:8000/gantt.html?id=software-lifecycle` | 開發流程 |

---

## 🎨 首頁設計

### 視覺特色
- **卡片網格佈局**：3-4 列響應式設計
- **軍綠 + 米色主題**：與詳細頁統一風格
- **深色模式支持**：自動適配用戶偏好
- **互動效果**：卡片懸停時上升並增加陰影

### 首頁卡片

每張卡片展示：
```
┌─────────────────────────────────┐
│  📚 項目圖標                    │
│                                 │
│  英文口說課程專案               │
│  (項目名稱)                     │
│                                 │
│  Q2-Q4 課程規劃甘特圖            │
│  (簡短描述)                     │
│                                 │
│  進入甘特圖  ➜                  │
│  (可點擊鏈結)                    │
└─────────────────────────────────┘
```

### 默認項目卡片（4 個）

```
1. 📚 英文口說課程專案
   Q2 (3-5月) → Q3 (6-8月) → Q4 (9-11月) 課程規劃甘特圖

2. 🔢 數學課程教學計劃
   代數 (1-3月) → 幾何 (4-6月) → 微積分 (7-9月)

3. 🎨 設計系統建置
   UI/UX 開發流程 - 規劃 → 設計 → 開發 → 測試

4. 🏗️ 軟體開發生命週期
   需求分析 → 開發 → 測試 → 上線
```

---

## 💾 數據管理

### 項目配置（app.js 中定義）

```javascript
const PROJECT_CONFIGS = {
    'english-q2q4': {
        title: '📚 英文口說課程專案進度追蹤',
        subtitle: 'Q2 (3-5月) → Q3 (6-8月) → Q4 (9-11月) 課程規劃甘特圖',
        storageKey: 'ganttProject_english-q2q4'
    },
    'math-courses': {
        title: '🔢 數學課程教學計劃',
        subtitle: '代數 (1-3月) → 幾何 (4-6月) → 微積分 (7-9月)',
        storageKey: 'ganttProject_math-courses'
    },
    // ... 更多項目
};
```

### 獨立 localStorage

每個項目有自己的 localStorage 鍵值：

| 項目 | 存儲鍵 |
|------|--------|
| 英文課程 | `ganttProject_english-q2q4` |
| 數學課程 | `ganttProject_math-courses` |
| 設計系統 | `ganttProject_design-system` |
| 軟體生命週期 | `ganttProject_software-lifecycle` |

**優勢**：
- 不同項目的數據完全隔離
- 不會互相污染或覆蓋
- 支持多個項目同時運行

---

## 🔧 技術實現

### app.js 的改變

1. **項目配置定義**
   ```javascript
   const PROJECT_CONFIGS = { ... };  // 所有項目信息
   let currentProjectId = 'english-q2q4';  // 當前項目 ID
   ```

2. **URL 參數讀取**
   ```javascript
   const urlParams = new URLSearchParams(window.location.search);
   const projectId = urlParams.get('id');
   if (projectId && PROJECT_CONFIGS[projectId]) {
       currentProjectId = projectId;
   }
   ```

3. **動態標題設置**
   ```javascript
   const config = PROJECT_CONFIGS[currentProjectId];
   if (config) {
       setPageTitle(config.title, config.subtitle);
   }
   ```

4. **獨立 localStorage**
   ```javascript
   function saveToLocalStorage() {
       const config = PROJECT_CONFIGS[currentProjectId];
       const storageKey = config ? config.storageKey : 'engCourseGantt_v2';
       // 使用項目特定的存儲鍵
       localStorage.setItem(storageKey, JSON.stringify(data));
   }
   ```

### home.js 的結構

```javascript
// 項目列表定義
const PROJECTS = [ ... ];

// DOM 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderProjectCards();
});

// 卡片渲染
function renderProjectCards() {
    PROJECTS.forEach(project => {
        // 創建卡片 HTML
        // 綁定點擊事件導航到 gantt.html?id=...
    });
}

// 深色模式支持
function toggleDarkMode() { ... }
function loadDarkModePreference() { ... }
```

---

## 🔗 用戶流程

### 典型使用流程

```
1. 用戶訪問 http://localhost:8000/
   ↓
2. 看到首頁卡片列表 (4 個項目)
   ↓
3. 點擊「英文課程」卡片
   ↓
4. 跳轉到 gantt.html?id=english-q2q4
   ↓
5. 甘特圖頁面加載
   - 讀取 URL 參數 id=english-q2q4
   - 設置標題為「英文口說課程專案進度追蹤」
   - 從 ganttProject_english-q2q4 加載任務數據
   - 渲染甘特圖和任務列表
   ↓
6. 用戶可以編輯任務、查看本週面板、深色模式等
   ↓
7. 用戶點擊「返回首頁」（未來功能）
   或使用瀏覽器回退按鈕回到首頁
```

### 多標籤頁使用

支持在不同標籤頁同時打開多個甘特圖：
- 標籤1：http://localhost:8000/gantt.html?id=english-q2q4
- 標籤2：http://localhost:8000/gantt.html?id=math-courses
- 標籤3：http://localhost:8000/gantt.html?id=design-system

每個標籤頁有自己的 localStorage 存儲，數據完全獨立。

---

## 🧪 測試首頁

### 快速開始

1. **啟動 HTTP 服務器**
   ```bash
   python -m http.server 8000
   ```

2. **訪問首頁**
   ```
   http://localhost:8000/
   ```

3. **應該看到**
   - ✅ 軍綠色頭部「甘特圖專案管理」
   - ✅ 4 張項目卡片網格
   - ✅ 每張卡片顯示圖標、名稱、描述
   - ✅ 右上角深色模式按鈕

4. **點擊卡片**
   - ✅ 應跳轉到 gantt.html?id=...
   - ✅ 頁面標題自動更新
   - ✅ 甘特圖加載項目數據

### 驗證清單

- [ ] 首頁正確加載並展示 4 個卡片
- [ ] 卡片網格在不同尺寸下響應正確（3 列 → 2 列 → 1 列）
- [ ] 點擊卡片進入正確的甘特圖頁面
- [ ] URL 參數正確傳遞（?id=...）
- [ ] 甘特圖頁面標題根據項目自動設置
- [ ] 深色模式在首頁和詳細頁都正常工作
- [ ] localStorage 數據獨立不混淆
- [ ] 版本檢查正確 (v=2.5)

---

## 🚀 未來擴展

### v2.6 規劃

1. **返回首頁按鈕**
   ```javascript
   // 在 gantt.html 頭部添加「返回首頁」按鈕
   <button id="homeBtn">← 返回首頁</button>
   ```

2. **新增項目功能**
   ```javascript
   // 首頁添加「新增項目」按鈕
   // 打開彈窗輸入項目名稱、描述、圖標
   ```

3. **項目編輯/刪除**
   ```javascript
   // 每張卡片添加設置圖標
   // 支持編輯項目信息或刪除項目
   ```

4. **項目列表持久化**
   ```javascript
   // 將項目列表存儲到 localStorage
   // 允許用戶自定義項目順序
   ```

### 實現建議

```javascript
// 首頁項目配置改為從 localStorage 讀取
function loadProjects() {
    const saved = localStorage.getItem('ganttProjects');
    if (saved) {
        return JSON.parse(saved);
    }
    return DEFAULT_PROJECTS;
}

// 保存項目列表
function saveProjects(projects) {
    localStorage.setItem('ganttProjects', JSON.stringify(projects));
}
```

---

## 📝 版本日誌

### v2.5 首頁系統
- ✅ 新增首頁 (index.html)
- ✅ 新增詳細頁 (gantt.html) 支持項目 ID
- ✅ 新增首頁邏輯 (home.js)
- ✅ 修改 app.js 支持 URL 參數和項目配置
- ✅ 4 個默認項目卡片
- ✅ 獨立 localStorage 存儲
- ✅ 深色模式支持
- ✅ 響應式設計

---

## 💡 技術亮點

### 1. URL 驅動的狀態管理
- 項目 ID 通過 URL 參數傳遞
- 支持直連和分享（gantt.html?id=xxx）
- 用戶可以加入書籤

### 2. 獨立的 localStorage
- 每個項目有自己的存儲空間
- 不會互相覆蓋
- 支持多標籤頁並行工作

### 3. 動態標題設置
- 利用之前實現的 `setPageTitle()` API
- 根據項目 ID 自動設置標題
- 用戶看到的標題與項目一致

### 4. 響應式首頁
- 在手機上縮至 1 列
- 在平板上 2 列
- 在桌面上 3-4 列

---

## ❓ 常見問題

**Q: 如何添加新項目？**
A: 目前需要編輯代碼。在 `app.js` 的 `PROJECT_CONFIGS` 和 `home.js` 的 `PROJECTS` 中添加新項目。v2.6 將支持 UI 新增。

**Q: 如何修改默認項目？**
A: 編輯 `app.js` 中的 `currentProjectId` 或更改 `gantt.html` 的默認 URL。

**Q: 多標籤頁會互相影響嗎？**
A: 不會。每個項目有獨立的 localStorage 鍵，數據完全隔離。

**Q: 如何返回首頁？**
A: 目前需要使用瀏覽器回退按鈕或在地址欄手動輸入。v2.6 將添加「返回首頁」按鈕。

---

**版本**：v2.5  
**狀態**：✅ 完成並可用  
**最後更新**：2026-05-26
