# 📋 頁面標題自訂 API 使用指南

## 🎯 概述

頁面標題現在可以通過全局 JavaScript API 動態自訂。這為未來的多甘特圖選擇頁面和動態內容加載提供了基礎。

---

## 🔧 API 函數

### 1. **setPageTitle(title, subtitle)** - 設置標題

#### 功能
修改頁面上的主標題和副標題文本。

#### 參數
- **title** (String) - 新的主標題文本（必須提供）
- **subtitle** (String, 可選) - 新的副標題文本
  - 如果省略：副標題保持不變
  - 如果為空字符串 `''`：副標題被隱藏
  - 如果提供內容：副標題被更新並顯示

#### 示例

```javascript
// ✅ 設置標題和副標題
setPageTitle('🎓 數學進度追蹤', '代數 (1-3月) → 幾何 (4-6月)');

// ✅ 只改變主標題，副標題不變
setPageTitle('新的主標題');

// ✅ 隱藏副標題
setPageTitle('只有主標題', '');

// ✅ 只有副標題的更新（保留原主標題）
const current = getPageTitle();
setPageTitle(current.title, '新的副標題');
```

---

### 2. **getPageTitle()** - 獲取當前標題

#### 功能
返回當前頁面上的標題信息。

#### 返回值
返回一個對象：
```javascript
{
    title: String,      // 當前主標題文本
    subtitle: String    // 當前副標題文本
}
```

#### 示例

```javascript
const current = getPageTitle();
console.log(current.title);     // "📚 英文口說課程專案進度追蹤"
console.log(current.subtitle);  // "Q2 (3-5月) → Q3 (6-8月) → Q4 (9-11月) 課程規劃甘特圖"

// 使用當前標題作為基礎進行修改
const newSubtitle = current.subtitle + ' ✅ 已更新';
setPageTitle(current.title, newSubtitle);
```

---

## 💡 常見使用場景

### 場景 1：項目名稱動態加載
```javascript
// 從 URL 參數或 API 獲取項目信息
const projectId = new URLSearchParams(window.location.search).get('id');

fetch(`/api/projects/${projectId}`)
    .then(res => res.json())
    .then(project => {
        setPageTitle(
            `📚 ${project.name} 進度追蹤`,
            `${project.description}`
        );
    });
```

### 場景 2：時間範圍動態更新
```javascript
function updateTitleWithDateRange() {
    const startMonth = 3;  // 3月
    const endMonth = 5;    // 5月
    
    setPageTitle(
        '📚 英文口說課程專案進度追蹤',
        `Q2 (${startMonth}-${endMonth}月) 課程規劃甘特圖`
    );
}

// 每月自動更新
setInterval(updateTitleWithDateRange, 86400000); // 每天檢查一次
```

### 場景 3：多甘特圖選擇頁面（未來功能）
```javascript
// 用戶點擊選擇一個甘特圖
function loadGanttChart(chartId) {
    const charts = {
        'english-q2': { 
            title: '📚 英文口說課程專案進度追蹤',
            subtitle: 'Q2 (3-5月) 課程規劃甘特圖'
        },
        'math-q1': { 
            title: '🔢 數學進度追蹤',
            subtitle: 'Q1 (1-3月) 課程規劃甘特圖'
        }
    };
    
    const chart = charts[chartId];
    if (chart) {
        setPageTitle(chart.title, chart.subtitle);
        // ... 加載甘特圖數據
    }
}

// 使用
loadGanttChart('english-q2');
```

### 場景 4：顯示狀態提示
```javascript
// 在標題中顯示同步狀態
const current = getPageTitle();

setPageTitle(
    current.title + ' 🔄 同步中...',
    current.subtitle
);

// 同步完成後
setTimeout(() => {
    setPageTitle(
        current.title.replace(' 🔄 同步中...', ' ✅ 已同步'),
        current.subtitle
    );
}, 2000);
```

---

## 🧪 測試

### 在瀏覽器控制台測試

1. **打開開發者工具**：按 `F12` 或右鍵 → 檢查

2. **切換到 Console 標籤**

3. **執行以下命令測試**：

```javascript
// 測試 1：改變標題和副標題
setPageTitle('🎯 測試標題', '這是測試副標題');

// 測試 2：隱藏副標題
setPageTitle('只有主標題', '');

// 測試 3：獲取當前標題
console.log(getPageTitle());

// 測試 4：恢復原來的標題
setPageTitle('📚 英文口說課程專案進度追蹤', 'Q2 (3-5月) → Q3 (6-8月) → Q4 (9-11月) 課程規劃甘特圖');
```

### 預期結果
- 頁面上的標題文本會立即改變
- 副標題可以隱藏或顯示
- 控制台輸出應該顯示正確的標題值

---

## ⚙️ 技術細節

### HTML 結構
```html
<header>
    <h1 id="pageTitle">📚 英文口說課程專案進度追蹤</h1>
    <p class="subtitle" id="pageSubtitle">Q2 (3-5月) → Q3 (6-8月) → Q4 (9-11月) 課程規劃甘特圖</p>
</header>
```

### JavaScript 實現
API 函數掛載到 `window` 對象，確保全局可用：

```javascript
window.setPageTitle = function(title, subtitle) {
    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');
    
    if (titleEl && title) {
        titleEl.textContent = title;
    }
    
    if (subtitleEl && subtitle !== undefined) {
        subtitleEl.textContent = subtitle;
        if (subtitle === '') {
            subtitleEl.style.display = 'none';
        } else {
            subtitleEl.style.display = 'block';
        }
    }
};

window.getPageTitle = function() {
    return {
        title: document.getElementById('pageTitle')?.textContent || '',
        subtitle: document.getElementById('pageSubtitle')?.textContent || ''
    };
};
```

---

## 📝 注意事項

1. **HTML 元素必須存在**
   - API 依賴 `id="pageTitle"` 和 `id="pageSubtitle"` 元素
   - 如果元素不存在，函數將無效（不會報錯）

2. **安全考慮**
   - API 接受任意字符串，包括 HTML 標籤
   - 用戶輸入應該先驗證或轉義避免 XSS 攻擊
   - 如果從外部源加載標題，應該使用 `textContent` 而不是 `innerHTML`

3. **性能考慮**
   - API 是同步的，立即更新 DOM
   - 在頻繁調用時（如實時更新）可能影響性能
   - 建議使用防抖（debounce）技術

4. **瀏覽器相容性**
   - 支持所有現代瀏覽器（Chrome、Firefox、Safari、Edge）
   - 使用可選鏈接操作符 `?.` 需要 ES2020 或更高

---

## 🔄 未來計劃

### v2.5 功能建議
- [ ] 添加 `onTitleChange` 回調函數
- [ ] 支持標題動畫過渡
- [ ] 儲存標題歷史記錄
- [ ] 添加標題模板系統

### 多甘特圖選擇頁面
```
homepage/
├── 甘特圖列表頁 (使用 API 不顯示標題或顯示 "選擇項目")
└── 單甘特圖頁 (使用 API 動態設置標題)
```

---

## ❓ 常見問題

**Q: 標題改變後會影響頁面標籤嗎？**
A: 不會。此 API 只改變頁面內容中的標題文本，不改變 `<title>` 標籤。如果需要改變頁面標籤，使用：
```javascript
document.title = '新的頁面標籤';
```

**Q: 可以在頁面加載前調用 API 嗎？**
A: 不可以。必須等到 DOM 加載完成。在 `DOMContentLoaded` 事件後調用是安全的。

**Q: 標題改變會被保存嗎？**
A: 不會。頁面重新加載時會回到默認標題。如果需要保存，可以使用 `localStorage`：
```javascript
setPageTitle('新標題', '新副標題');
localStorage.setItem('ganttTitle', JSON.stringify(getPageTitle()));
```

---

**版本**：v2.4  
**最後更新**：2026-05-26  
**狀態**：✅ 已實現並可用
