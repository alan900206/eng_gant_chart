# 🎨 色彩主題更新 & 標題自訂功能

## ✅ 完成的更改

### 1️⃣ **軍綠色調 + 米色主題**

#### 色系定義：
| 用途 | 顏色 | HEX 代碼 |
|------|------|---------|
| 主色（軍綠） | 軍綠 | `#4a6741` |
| 亮色 | 亮軍綠 | `#5a7c59` |
| 深色 | 深軍綠 | `#3d5636` |
| 背景 | 米色 | `#ece6db` |
| 白色 | 純白 | `#ffffff` |

#### 受影響的元素：
- ✅ **頭部**：深軍綠背景 (#4a6741)
- ✅ **控制按鈕**：軍綠色主按鈕，灰色次按鈕
- ✅ **切換按鈕**：軍綠色 → 懸停時變亮 (#5a7c59)
- ✅ **甘特圖**：白色背景，軍綠色任務條
- ✅ **圖例**：米色背景 (#ece6db)
- ✅ **任務清單**：白色卡片，軍綠色左邊框
- ✅ **深色模式**：深灰綠色背景 (#2a3a2f, #3d4a40)

### 2️⃣ **移除所有漸層**

已移除的漸層：
```css
❌ linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6366f1 100%)  /* 舊紫色漸層 */
❌ linear-gradient(180deg, rgba(248, 249, 255, 0.95) 0%, ...)      /* 舊藍色漸層 */

✅ 替換為純色：
   #4a6741      /* 軍綠色 */
   #ece6db      /* 米色 */
   #ffffff      /* 白色 */
   #3d5636      /* 深軍綠 */
```

### 3️⃣ **標題自訂功能**

#### 新增 JavaScript 全局 API：

```javascript
// 設置頁面標題和副標題
setPageTitle('新的標題', '新的副標題');

// 或只設置標題，保留副標題
setPageTitle('只改標題');

// 隱藏副標題
setPageTitle('標題', '');

// 獲取當前標題
const titles = getPageTitle();
console.log(titles.title);      // 當前標題
console.log(titles.subtitle);   // 當前副標題
```

#### HTML 中的改動：

```html
<!-- 改為使用 id，便於 JavaScript 控制 -->
<h1 id="pageTitle">📚 英文口說課程專案進度追蹤</h1>
<p class="subtitle" id="pageSubtitle">Q2 (3-5月) → Q3 (6-8月) → Q4 (9-11月) 課程規劃甘特圖</p>
```

#### 使用場景（未來規劃）：

頁面初始化時動態設置標題：
```javascript
// 假設從 URL 參數或 API 讀取
const projectName = getSelectedProject(); // 例：'英文進度追蹤'
const quarter = getCurrentQuarter();      // 例：'Q2-Q4'

setPageTitle(
    `📚 ${projectName} 進度追蹤`,
    `${quarter} 課程規劃甘特圖`
);
```

---

## 🎨 色彩參考

### 亮色模式
```
背景色組：
  Body 背景：#ece6db (米色)
  Header：#4a6741 (軍綠)
  容器：#ffffff (純白)
  面板：#ece6db (米色)

強調色：
  主按鈕：#4a6741 (軍綠)
  懸停：#5a7c59 (亮軍綠)
  任務條：#4a6741 (軍綠)
```

### 深色模式
```
背景色組：
  Body 背景：#2a3a2f (深灰綠)
  Header：#2a3a2f (深灰綠)
  容器：#3d4a40 (深軍綠)
  面板：#3d4a40 (深軍綠)

文字色：
  標題：#d4c5b0 (米色)
  副標題：#c0cdb8 (淺軍綠)
  本文：#e2e8f0 (淺灰)
```

---

## 📁 修改的文件

| 文件 | 修改內容 |
|------|--------|
| **index.html** | • 添加 `id="pageTitle"` 和 `id="pageSubtitle"`<br>• 版本 v=2.2 → v=2.3 |
| **app.js** | • 新增 `setPageTitle()` 全局函數<br>• 新增 `getPageTitle()` 全局函數 |
| **styles.css** | • 移除所有漸層<br>• 替換 667 處紫色引用為軍綠色<br>• 替換背景色為米色<br>• 更新深色模式色彩 |
| **CHECK.html** | • 版本檢查更新為 v=2.3 |

---

## 🚀 使用方式

### 測試色彩更新：

1. **清除快取**：`Ctrl + Shift + R`
2. **重新打開**：`http://localhost:8000`
3. **應該看到：**
   - ✅ 深軍綠色頭部
   - ✅ 米色背景頁面
   - ✅ 軍綠色按鈕和任務條
   - ✅ 無漸層效果

### 測試標題自訂功能：

在瀏覽器控制台執行：
```javascript
// 測試 1：改變標題
setPageTitle('🎓 數學進度追蹤', '代數 (1-3月) → 幾何 (4-6月)');

// 測試 2：隱藏副標題
setPageTitle('🎓 簡單標題', '');

// 測試 3：獲取當前標題
console.log(getPageTitle());
```

---

## 💡 未來規劃

### 多甘特圖選擇頁面
```
進入網頁 → 選擇甘特圖列表 → 點擊特定項目 → 進入詳細甘特圖
          │                         │
          └─ setPageTitle() 更新標題 ─┘
```

支持的參數傳遞方式：
- URL Query：`?title=XXX&subtitle=YYY`
- 本地存儲：`localStorage.setItem('ganttTitle', 'XXX')`
- API 載入：`fetch('/api/projects/{id}').then(r => setPageTitle(...))`

---

## ✨ 色彩特色

### 軍綠色調的優勢：
- 🎖️ 專業、沉著的視覺感受
- 📊 適合項目管理和進度追蹤
- 👁️ 低視覺疲勞（相比紫藍漸層）
- 🌿 自然、柔和的配色

### 米色背景的優勢：
- 📝 提高可讀性（比純白更溫和）
- 🎨 與軍綠色形成優雅對比
- 👁️ 長時間使用更舒適
- ♿ 改善無障礙性（對弱視用戶友善）

---

**色彩主題已準備好未來擴展！** 🎉
