// 英文口說課程專案甘特圖 - 主要應用程式邏輯

// ============ 項目配置 ============
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
    'design-system': {
        title: '🎨 設計系統建置',
        subtitle: 'UI/UX 開發流程 - 規劃 → 設計 → 開發 → 測試',
        storageKey: 'ganttProject_design-system'
    },
    'software-lifecycle': {
        title: '🏗️ 軟體開發生命週期',
        subtitle: '需求分析 → 開發 → 測試 → 上線',
        storageKey: 'ganttProject_software-lifecycle'
    }
};

// ============ 預設類別資料 ============
let categories = {
    'q2': { name: 'Q2 課程 (3-5月)', color: '#3498db' },
    'q3': { name: 'Q3 課程 (6-8月)', color: '#27ae60' },
    'q4': { name: 'Q4 課程 (9-11月)', color: '#9b59b6' },
    'q3-prep': { name: 'Q3 準備工作', color: '#e67e22' },
    'assessment': { name: '評量作業', color: '#e74c3c' },
    'milestone': { name: '重要節點', color: '#f1c40f' },
    'other': { name: '其他', color: '#95a5a6' }
};

// ============ 預設任務資料 ============
let tasks = [
    {
        id: 'task-1771921088102',
        name: '主管提名Q3',
        start: '2026-03-30',
        end: '2026-04-10',
        category: 'q3-prep',
        dependencies: '',
        completed: false
    },
    {
        id: 'task-1771921216957',
        name: '調查Q2學生是否續上',
        start: '2026-04-13',
        end: '2026-04-17',
        category: 'milestone',
        dependencies: '',
        completed: false
    },
    {
        id: 'task-1771921303107',
        name: '安排Q3前測',
        start: '2026-04-20',
        end: '2026-04-25',
        category: 'q3-prep',
        dependencies: '',
        completed: false
    },
    {
        id: 'task-1771921372123',
        name: '回收Q3學生上課意願',
        start: '2026-04-13',
        end: '2026-04-17',
        category: 'q3-prep',
        dependencies: '',
        completed: false
    },
    {
        id: 'task-1771921464963',
        name: '預計Q3開課',
        start: '2026-06-09',
        end: '2026-06-09',
        category: 'milestone',
        dependencies: '',
        completed: false
    },
    {
        id: 'task-1771921493547',
        name: '預計Q3結束',
        start: '2026-08-21',
        end: '2026-08-21',
        category: 'milestone',
        dependencies: '',
        completed: false
    },
    {
        id: 'task-1771921527863',
        name: '預計Q4開課',
        start: '2026-09-08',
        end: '2026-09-08',
        category: 'milestone',
        dependencies: '',
        completed: false
    },
    {
        id: 'task-1771921655597',
        name: '預計Q4結束',
        start: '2026-11-20',
        end: '2026-11-20',
        category: 'milestone',
        dependencies: '',
        completed: false
    }
];

// ============ 全域變數 ============
let gantt;
let currentViewMode = 'Week';  // 改為週視圖為預設
let editingTaskId = null;
let isLocked = true;
let currentProjectId = 'english-q2q4';  // 當前項目 ID

// ============ 動態套用類別顏色 ============
function applyDynamicStyles() {
    let styleEl = document.getElementById('dynamic-category-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-category-styles';
        document.head.appendChild(styleEl);
    }

    let css = '';
    for (const [id, cat] of Object.entries(categories)) {
        // Frappe Gantt 把 custom_class 加在 bar-wrapper 上
        css += `.gantt .bar-wrapper.${id} .bar { fill: ${cat.color}; }\n`;
        css += `.gantt .bar-wrapper.${id}:hover .bar { fill: ${cat.color}; filter: brightness(0.9); }\n`;
        css += `.task-item.${id} { border-left-color: ${cat.color}; }\n`;
        css += `.legend-color.${id} { background: ${cat.color}; }\n`;
    }
    styleEl.textContent = css;
}

// ============ 渲染圖例 ============
function renderLegend() {
    const container = document.getElementById('legendContainer');
    container.innerHTML = '';
    
    for (const [id, cat] of Object.entries(categories)) {
        const item = document.createElement('span');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-color ${id}"></span>${cat.name}`;
        container.appendChild(item);
    }
}

// ============ 更新類別下拉選單 ============
function updateCategorySelect() {
    const select = document.getElementById('taskCategory');
    select.innerHTML = '';
    
    for (const [id, cat] of Object.entries(categories)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = cat.name;
        select.appendChild(option);
    }
}

// ============ 更新前置任務下拉選單 ============
function updateDependencySelect(excludeTaskId = null) {
    const select = document.getElementById('taskDependency');
    select.innerHTML = '<option value="">無</option>';
    
    tasks.forEach(task => {
        // 排除自己（編輯時不能選自己為前置任務）
        if (task.id !== excludeTaskId) {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            select.appendChild(option);
        }
    });
}

// ============ 初始化甘特圖 ============
function initGantt() {
    const ganttTasks = tasks.map(task => ({
        id: task.id,
        name: task.name,
        start: task.start,
        end: task.end,
        progress: 0,
        dependencies: task.dependencies,
        custom_class: task.category
    }));

    gantt = new Gantt("#gantt", ganttTasks, {
        view_mode: currentViewMode,
        date_format: 'YYYY-MM-DD',
        language: 'zh',
        bar_height: 28,
        padding: 22,
        custom_popup_html: function(task) {
            const taskData = tasks.find(t => t.id === task.id);
            const categoryName = taskData && categories[taskData.category] 
                ? categories[taskData.category].name 
                : '未分類';
            const notes = taskData && taskData.notes ? taskData.notes : '';
            return `
                <div class="gantt-popup">
                    <h4>${task.name}</h4>
                    <p><strong>類別：</strong>${categoryName}</p>
                    <p><strong>開始：</strong>${task.start.toLocaleDateString('zh-TW')}</p>
                    <p><strong>結束：</strong>${task._end.toLocaleDateString('zh-TW')}</p>
                    ${notes ? `<p><strong>備註：</strong>${notes}</p>` : ''}
                    <p style="color: #999; font-size: 0.85rem; margin-top: 8px;">💡 雙擊可快速編輯</p>
                </div>
            `;
        },
        on_click: function(task) {
            highlightTask(task.id);
        },
        on_date_change: function(task, start, end) {
            // 甘特圖唯讀，不允許拖曳修改
        },
        on_progress_change: function() {
            // 進度功能已停用
        }
    });

    applyDynamicStyles();
    renderLegend();
    renderTaskList();
    updateCategorySelect();
    setupHoverTooltip();
    setupGanttInteraction();
    
    // 自動滾動到今天的日期
    scrollToToday();
}

// ============ 自動滾動到今天 ============
function scrollToToday() {
    // 延遲執行，確保 SVG 已完全渲染
    setTimeout(() => {
        const ganttWrapper = document.getElementById('ganttWrapper');
        if (!ganttWrapper) return;
        
        const svg = ganttWrapper.querySelector('svg');
        if (!svg) return;
        
        // 取得今天日期
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 計算 SVG 中今天應該在的位置
        // Frappe Gantt 預設格線寬度為 30px per day
        const ganttContent = svg.querySelector('[data-date]');
        if (!ganttContent) {
            // 如果找不到具體日期元素，用另一種方法
            // 取得最早任務的開始日期
            if (tasks.length > 0) {
                const minDate = new Date(Math.min(...tasks.map(t => new Date(t.start).getTime())));
                const daysFromMin = Math.floor((today - minDate) / (1000 * 60 * 60 * 24));
                const pixelsToScroll = Math.max(0, daysFromMin * 30 - 200);
                ganttWrapper.scrollLeft = pixelsToScroll;
            }
        } else {
            // 嘗試計算滾動位置
            const svgRect = svg.getBoundingClientRect();
            const wrapperRect = ganttWrapper.getBoundingClientRect();
            
            // 估計滾動位置（每天 30 像素）
            if (tasks.length > 0) {
                const minDate = new Date(Math.min(...tasks.map(t => new Date(t.start).getTime())));
                const daysFromMin = Math.floor((today - minDate) / (1000 * 60 * 60 * 24));
                const pixelsToScroll = Math.max(0, daysFromMin * 30 - 200);
                ganttWrapper.scrollLeft = pixelsToScroll;
            }
        }
    }, 500);
}

// ============ 深色模式 ============
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const btn = document.getElementById('darkModeBtn');
    btn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
}

function loadDarkModePreference() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeBtn').textContent = '☀️';
    }
}

// ============ 篩選器類別更新 ============
function updateFilterCategorySelect() {
    const select = document.getElementById('filterCategory');
    select.innerHTML = '<option value="">全部類別</option>';
    
    for (const [id, cat] of Object.entries(categories)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = cat.name;
        select.appendChild(option);
    }
}

// ============ 懸浮提示框 ============
function setupHoverTooltip() {
    const tooltip = document.getElementById('hoverTooltip');
    const ganttWrapper = document.getElementById('ganttWrapper');
    let currentHoveredTask = null;
    
    // 因為 bar-wrapper 有 pointer-events:none，改用座標偵測
    ganttWrapper.addEventListener('mousemove', function(e) {
        const svgEl = ganttWrapper.querySelector('svg');
        if (!svgEl) return;
        
        const bars = svgEl.querySelectorAll('.bar-wrapper');
        let found = null;
        
        for (const bar of bars) {
            const rect = bar.querySelector('.bar');
            if (!rect) continue;
            const bbox = rect.getBoundingClientRect();
            if (e.clientX >= bbox.left && e.clientX <= bbox.right &&
                e.clientY >= bbox.top && e.clientY <= bbox.bottom) {
                found = bar;
                break;
            }
        }
        
        if (found) {
            const taskId = found.getAttribute('data-id');
            
            if (currentHoveredTask !== taskId) {
                currentHoveredTask = taskId;
                const taskData = tasks.find(t => t.id === taskId);
                if (!taskData) return;
                
                const categoryName = categories[taskData.category] 
                    ? categories[taskData.category].name 
                    : '未分類';
                
                let html = `
                    <h4>${taskData.name}</h4>
                    <p><strong>類別：</strong>${categoryName}</p>
                    <p><strong>開始：</strong>${taskData.start}</p>
                    <p><strong>結束：</strong>${taskData.end}</p>
                `;
                
                if (taskData.notes) {
                    html += `<div class="notes"><strong>備註：</strong>${taskData.notes}</div>`;
                }
                
                tooltip.innerHTML = html;
            }
            
            // 先顯示 tooltip 來取得真實尺寸
            tooltip.style.left = '-9999px';
            tooltip.style.top = '-9999px';
            tooltip.classList.add('visible');
            
            // 讀取真實尺寸
            const ttWidth = tooltip.offsetWidth;
            const ttHeight = tooltip.offsetHeight;
            const margin = 15;
            
            let left = e.clientX + margin;
            let top = e.clientY + margin;
            
            // 右側溢出 → 移到滑鼠左邊
            if (left + ttWidth > window.innerWidth - 10) {
                left = e.clientX - ttWidth - margin;
            }
            // 下方溢出 → 移到滑鼠上方
            if (top + ttHeight > window.innerHeight - 10) {
                top = e.clientY - ttHeight - margin;
            }
            // 防止超出左/上邊界
            if (left < 5) left = 5;
            if (top < 5) top = 5;
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        } else {
            if (currentHoveredTask) {
                currentHoveredTask = null;
                tooltip.classList.remove('visible');
            }
        }
    });
    
    ganttWrapper.addEventListener('mouseleave', function() {
        currentHoveredTask = null;
        tooltip.classList.remove('visible');
    });
    
    // 添加「今日線」視覺指示
    addTodayIndicator();
}

// ============ 添加今日線指示 ============
function addTodayIndicator() {
    const ganttWrapper = document.getElementById('ganttWrapper');
    if (!ganttWrapper) return;
    
    setTimeout(() => {
        const svg = ganttWrapper.querySelector('svg');
        if (!svg) return;
        
        // 移除舊的今日線
        const oldLine = svg.querySelector('.today-indicator-line');
        if (oldLine) oldLine.remove();
        
        // 計算今天應該在的 x 位置
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (tasks.length === 0) return;
        
        const minDate = new Date(Math.min(...tasks.map(t => new Date(t.start).getTime())));
        const daysFromMin = Math.floor((today - minDate) / (1000 * 60 * 60 * 24));
        const xPosition = 80 + (daysFromMin * 30); // 80 是左邊界，30px per day
        
        // 建立今日線
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'today-indicator-line');
        line.setAttribute('x1', xPosition);
        line.setAttribute('y1', '0');
        line.setAttribute('x2', xPosition);
        line.setAttribute('y2', '100%');
        line.setAttribute('stroke', '#e74c3c');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        line.setAttribute('opacity', '0.7');
        
        // 添加標籤
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', xPosition + 5);
        label.setAttribute('y', '20');
        label.setAttribute('font-size', '12');
        label.setAttribute('fill', '#e74c3c');
        label.setAttribute('font-weight', 'bold');
        label.textContent = '今天';
        
        svg.appendChild(line);
        svg.appendChild(label);
    }, 600);
}

// ============ 渲染任務清單 ============
function renderTaskList() {
    const taskListEl = document.getElementById('taskList');
    taskListEl.innerHTML = '';
    
    // 取得篩選條件
    const searchText = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterCategory = document.getElementById('filterCategory')?.value || '';
    const filterStatus = document.getElementById('filterStatus')?.value || '';
    
    // 篩選任務
    const filteredTasks = tasks.filter(task => {
        const matchSearch = !searchText || task.name.toLowerCase().includes(searchText);
        const matchCategory = !filterCategory || task.category === filterCategory;
        const matchStatus = !filterStatus || 
            (filterStatus === 'completed' && task.completed) ||
            (filterStatus === 'incomplete' && !task.completed);
        return matchSearch && matchCategory && matchStatus;
    });

    filteredTasks.forEach((task, index) => {
        const categoryName = categories[task.category] 
            ? categories[task.category].name 
            : '未分類';
        
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.category}${task.completed ? ' completed' : ''}`;
        taskItem.id = `task-card-${task.id}`;
        taskItem.draggable = true;
        taskItem.dataset.taskId = task.id;
        taskItem.style.animationDelay = `${index * 0.05}s`;
        
        taskItem.innerHTML = `
            <div style="display:flex; align-items:flex-start; gap: 10px;">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="toggleTaskComplete('${task.id}')" title="標記完成">
                <h4 style="flex:1;">${task.name}</h4>
            </div>
            <div class="task-meta">
                <span>📅 ${formatDate(task.start)} ~ ${formatDate(task.end)}</span>
                <span>🏷️ ${categoryName}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-secondary" onclick="editTask('${task.id}')">編輯</button>
                <button class="btn" style="background: #17a2b8; color: white;" onclick="copyTask('${task.id}')" title="複製任務">📋</button>
                <button class="btn" style="background: #e74c3c; color: white;" onclick="deleteTask('${task.id}')">刪除</button>
            </div>
        `;
        
        // 拖曳事件
        taskItem.addEventListener('dragstart', handleDragStart);
        taskItem.addEventListener('dragend', handleDragEnd);
        taskItem.addEventListener('dragover', handleDragOver);
        taskItem.addEventListener('dragleave', handleDragLeave);
        taskItem.addEventListener('drop', handleDrop);
        
        taskListEl.appendChild(taskItem);
    });
}

// ============ 完成狀態切換 ============
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTaskList();
        refreshWeeklyPanelIfOpen();
        saveToLocalStorage();
    }
}

// ============ 複製任務 ============
function copyTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newTask = {
        ...task,
        id: `task-${Date.now()}`,
        name: task.name + ' (副本)',
        completed: false
    };
    
    // 在原任務後面插入
    const index = tasks.findIndex(t => t.id === taskId);
    tasks.splice(index + 1, 0, newTask);
    
    refreshGantt();
    saveToLocalStorage();
}

// ============ 拖曳排序 ============
let draggedTask = null;

function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.task-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (this !== draggedTask) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (draggedTask === this) return;
    
    const draggedId = draggedTask.dataset.taskId;
    const targetId = this.dataset.taskId;
    
    const draggedIndex = tasks.findIndex(t => t.id === draggedId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // 移動任務
    const [movedTask] = tasks.splice(draggedIndex, 1);
    tasks.splice(targetIndex, 0, movedTask);
    
    refreshGantt();
    saveToLocalStorage();
}

// ============ 任務上下移動 ============
function moveTask(taskId, direction) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= tasks.length) return;
    
    [tasks[index], tasks[newIndex]] = [tasks[newIndex], tasks[index]];
    
    refreshGantt();
    saveToLocalStorage();
}

// ============ 輔助函式 ============
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
}

function highlightTask(taskId) {
    // 移除所有高亮
    document.querySelectorAll('.task-item').forEach(el => {
        el.style.boxShadow = '';
    });
    
    // 高亮選中的任務
    const taskCard = document.getElementById(`task-card-${taskId}`);
    if (taskCard) {
        taskCard.style.boxShadow = '0 0 0 3px #667eea, 0 8px 25px rgba(102, 126, 234, 0.3)';
        taskCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ============ 任務操作 ============
function updateTaskDates(taskId, start, end) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.start = formatDateForInput(start);
        task.end = formatDateForInput(end);
        renderTaskList();
        refreshWeeklyPanelIfOpen();
        saveToLocalStorage();
    }
}

function formatDateForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============ 鎖定功能 ============
function toggleLock() {
    isLocked = !isLocked;
    const btn = document.getElementById('lockBtn');
    const wrapper = document.querySelector('.gantt-outer');
    
    if (isLocked) {
        btn.textContent = '🔒 已鎖定';
        btn.classList.add('locked');
        wrapper.classList.add('gantt-locked');
    } else {
        btn.textContent = '🔓 已解鎖';
        btn.classList.remove('locked');
        wrapper.classList.remove('gantt-locked');
    }
}

// ============ 新增/編輯任務 ============
function openModal(isEdit = false) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = isEdit ? '編輯任務' : '新增任務';
    clearValidationErrors(); // 清除之前的錯誤
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('active');
    editingTaskId = null;
    document.getElementById('taskForm').reset();
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;
    
    // 更新前置任務下拉選單（排除自己）
    updateDependencySelect(taskId);
    
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskStart').value = task.start;
    document.getElementById('taskEnd').value = task.end;
    document.getElementById('taskCategory').value = task.category;
    document.getElementById('taskDependency').value = task.dependencies || '';
    document.getElementById('taskNotes').value = task.notes || '';
    
    openModal(true);
}

function deleteTask(taskId) {
    if (!confirm('確定要刪除這個任務嗎？')) return;
    
    tasks = tasks.filter(t => t.id !== taskId);
    refreshGantt();
    saveToLocalStorage();
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('taskName').value;
    const start = document.getElementById('taskStart').value;
    const end = document.getElementById('taskEnd').value;
    const category = document.getElementById('taskCategory').value;
    const dependencies = document.getElementById('taskDependency').value;
    const notes = document.getElementById('taskNotes').value;
    
    if (editingTaskId) {
        const task = tasks.find(t => t.id === editingTaskId);
        if (task) {
            task.name = name;
            task.start = start;
            task.end = end;
            task.category = category;
            task.dependencies = dependencies;
            task.notes = notes;
        }
    } else {
        const newTask = {
            id: `task-${Date.now()}`,
            name: name,
            start: start,
            end: end,
            category: category,
            dependencies: dependencies,
            notes: notes,
            completed: false
        };
        tasks.push(newTask);
    }
    
    // 驗證衝突
    const errors = validateTaskDependencies(editingTaskId);
    if (errors.length > 0) {
        displayValidationErrors(errors);
        return; // 不關閉彈窗，讓用戶修正
    }
    
    clearValidationErrors();
    closeModal();
    refreshGantt();
    saveToLocalStorage();
}

// ============ 類別管理 ============
function openCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.add('active');
    renderCategoryList();
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.remove('active');
}

function renderCategoryList() {
    const list = document.getElementById('categoryList');
    list.innerHTML = '';
    
    for (const [id, cat] of Object.entries(categories)) {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <span class="color-dot" style="background: ${cat.color}"></span>
            <div class="category-info">
                <div class="cat-id">${id}</div>
                <div class="cat-name">${cat.name}</div>
            </div>
            <button class="delete-cat-btn" onclick="deleteCategory('${id}')">刪除</button>
        `;
        list.appendChild(item);
    }
}

function addCategory() {
    const id = document.getElementById('newCategoryId').value.trim().toLowerCase().replace(/\s+/g, '-');
    const name = document.getElementById('newCategoryName').value.trim();
    const color = document.getElementById('newCategoryColor').value;
    
    if (!id || !name) {
        alert('請填寫類別代碼和名稱');
        return;
    }
    
    if (categories[id]) {
        alert('此類別代碼已存在');
        return;
    }
    
    categories[id] = { name, color };
    
    document.getElementById('newCategoryId').value = '';
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryColor').value = '#667eea';
    
    applyDynamicStyles();
    renderLegend();
    renderCategoryList();
    updateCategorySelect();
    updateFilterCategorySelect();
    saveToLocalStorage();
}

function deleteCategory(id) {
    const tasksUsingCategory = tasks.filter(t => t.category === id);
    if (tasksUsingCategory.length > 0) {
        alert(`無法刪除：有 ${tasksUsingCategory.length} 個任務正在使用此類別`);
        return;
    }
    
    if (!confirm(`確定要刪除類別「${categories[id].name}」嗎？`)) return;
    
    delete categories[id];
    
    applyDynamicStyles();
    renderLegend();
    renderCategoryList();
    updateCategorySelect();
    updateFilterCategorySelect();
    saveToLocalStorage();
}

// ============ 重新整理甘特圖 ============
function refreshGantt() {
    const ganttTasks = tasks.map(task => ({
        id: task.id,
        name: task.name,
        start: task.start,
        end: task.end,
        progress: 0,
        dependencies: task.dependencies,
        custom_class: task.category
    }));
    
    gantt.refresh(ganttTasks);
    renderTaskList();
    refreshWeeklyPanelIfOpen();
}

// ============ 切換視圖模式 ============
function changeViewMode(mode) {
    currentViewMode = mode;
    gantt.change_view_mode(mode);
    
    document.querySelectorAll('.view-modes .btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
}

// ============ 本地儲存 ============
function saveToLocalStorage() {
    const config = PROJECT_CONFIGS[currentProjectId];
    const storageKey = config ? config.storageKey : 'engCourseGantt_v2';
    const data = {
        projectId: currentProjectId,
        tasks: tasks,
        categories: categories
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
}

function loadFromLocalStorage() {
    const config = PROJECT_CONFIGS[currentProjectId];
    const storageKey = config ? config.storageKey : 'engCourseGantt_v2';
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
        const data = JSON.parse(saved);
        if (data.tasks) {
            tasks = data.tasks;
            // 確保所有舊任務都有 completed 字段
            tasks.forEach(task => {
                if (!task.hasOwnProperty('completed')) {
                    task.completed = false;
                }
            });
        }
        if (data.categories) categories = data.categories;
    }
}

// ============ 本週任務面板 ============
function refreshWeeklyPanelIfOpen() {
    const panel = document.getElementById('weeklyPanel');
    if (panel && panel.classList.contains('open')) {
        renderWeeklyTasks();
    }
}

function toggleWeeklyPanel() {
    const panel = document.getElementById('weeklyPanel');
    const toggle = document.getElementById('weeklyToggle');
    const overlay = document.getElementById('weeklyOverlay');
    
    const isOpen = panel.classList.contains('open');
    
    if (isOpen) {
        panel.classList.remove('open');
        toggle.classList.remove('shifted');
        overlay.classList.remove('visible');
    } else {
        renderWeeklyTasks();
        panel.classList.add('open');
        toggle.classList.add('shifted');
        overlay.classList.add('visible');
    }
}

function getWeekRange() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { start: monday, end: sunday };
}

function renderWeeklyTasks() {
    const { start, end } = getWeekRange();
    const listEl = document.getElementById('weeklyTaskList');
    const dateRangeEl = document.getElementById('weeklyDateRange');
    const statsEl = document.getElementById('weeklyStats');
    
    // 顯示日期範圍
    const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    dateRangeEl.textContent = `${fmt(start)} (一) ~ ${fmt(end)} (日)`;
    
    // 分類任務 - 按狀態區分
    const urgent = [];      // 今天或逾期
    const critical = [];    // 1-3天
    const warning = [];     // 4-7天  
    const normal = [];      // 遠期
    const completed = [];   // 已完成
    
    tasks.forEach(task => {
        // 優先顯示已完成的任務
        if (task.completed) {
            completed.push(task);
            return;
        }
        
        const taskEnd = new Date(task.end);
        const daysRemaining = calculateDaysRemaining(taskEnd);
        const urgency = getUrgencyLevel(daysRemaining);
        
        const taskWithMeta = {
            ...task,
            daysRemaining,
            urgency
        };
        
        if (urgency.level === 'overdue' || urgency.level === 'today') {
            urgent.push(taskWithMeta);
        } else if (urgency.level === 'critical') {
            critical.push(taskWithMeta);
        } else if (urgency.level === 'warning') {
            warning.push(taskWithMeta);
        } else {
            normal.push(taskWithMeta);
        }
    });
    
    // 統計信息
    const totalTasks = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;
    const urgentCount = urgent.length + critical.length;
    
    statsEl.innerHTML = `
        <div class="weekly-stats-content">
            <div class="stat-item"><span class="stat-label">未完成</span><span class="stat-number">${totalTasks}</span></div>
            <div class="stat-item"><span class="stat-label">已完成</span><span class="stat-number">${completedCount}</span></div>
            <div class="stat-item"><span class="stat-label">緊急</span><span class="stat-number urgent">${urgentCount}</span></div>
        </div>
    `;
    
    let html = '';
    
    if (urgent.length === 0 && critical.length === 0 && warning.length === 0 && 
        normal.length === 0 && completed.length === 0) {
        html = '<div class="weekly-empty">🎉 本週沒有任務</div>';
    } else {
        if (urgent.length > 0) {
            html += renderWeeklySection('🔴 今天/逾期', urgent, 'urgent');
        }
        if (critical.length > 0) {
            html += renderWeeklySection('🟠 緊急 (1-3天)', critical, 'critical');
        }
        if (warning.length > 0) {
            html += renderWeeklySection('🟡 本週 (4-7天)', warning, 'warning');
        }
        if (normal.length > 0) {
            html += renderWeeklySection('🟢 正常', normal, 'normal');
        }
        if (completed.length > 0) {
            html += renderWeeklySection('✅ 已完成', completed, 'completed');
        }
    }
    
    listEl.innerHTML = html;
}

function renderWeeklySection(title, taskList, type) {
    let html = `<div class="weekly-section weekly-section-${type}">
        <div class="weekly-section-title">${title}</div>`;
    
    taskList.forEach(task => {
        const cat = categories[task.category];
        const borderColor = cat ? cat.color : '#667eea';
        const completedClass = task.completed ? ' completed-task' : '';
        
        let daysText = '';
        if (!task.completed && task.daysRemaining !== undefined) {
            const days = task.daysRemaining;
            if (days < 0) {
                daysText = `<span class="days-remaining overdue">逾期 ${Math.abs(days)} 天</span>`;
            } else if (days === 0) {
                daysText = `<span class="days-remaining today">今天</span>`;
            } else {
                daysText = `<span class="days-remaining">剩 ${days} 天</span>`;
            }
        }
        
        html += `
            <div class="weekly-task-card${completedClass} weekly-task-${type}" style="border-left-color: ${borderColor};">
                <div class="task-name">
                    <input type="checkbox" class="weekly-task-checkbox" ${task.completed ? 'checked' : ''} 
                        onchange="toggleTaskComplete('${task.id}')" title="標記完成">
                    <span>${task.completed ? '✅ ' : ''}${task.name}</span>
                </div>
                <div class="task-meta-weekly">
                    <span>📅 ${task.start}</span>
                    ${daysText}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// ============ 事件監聽器 ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded - 開始初始化甘特圖');
    
    // 讀取 URL 參數中的項目 ID
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    if (projectId && PROJECT_CONFIGS[projectId]) {
        currentProjectId = projectId;
    }
    
    // 根據項目 ID 設置標題
    const config = PROJECT_CONFIGS[currentProjectId];
    if (config) {
        setPageTitle(config.title, config.subtitle);
    }
    
    loadFromLocalStorage();
    initGantt();
    console.log('✅ initGantt 完成 - 甘特圖初始化成功');
    
    // 本週任務面板
    document.getElementById('weeklyToggle').addEventListener('click', toggleWeeklyPanel);
    document.getElementById('weeklyOverlay').addEventListener('click', toggleWeeklyPanel);
    
    // 視圖模式切換
    document.querySelectorAll('.view-modes .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            changeViewMode(this.dataset.mode);
        });
    });
    
    // 新增任務按鈕
    document.getElementById('addTaskBtn').addEventListener('click', function() {
        editingTaskId = null;
        document.getElementById('taskForm').reset();
        
        // 更新前置任務下拉選單
        updateDependencySelect();
        
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        document.getElementById('taskStart').value = formatDateForInput(today);
        document.getElementById('taskEnd').value = formatDateForInput(nextWeek);
        
        openModal(false);
    });
    
    // 類別管理按鈕
    document.getElementById('categoryBtn').addEventListener('click', openCategoryModal);
    document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
    
    // 搜尋與篩選
    document.getElementById('searchInput').addEventListener('input', renderTaskList);
    document.getElementById('filterCategory').addEventListener('change', renderTaskList);
    document.getElementById('filterStatus').addEventListener('change', renderTaskList);
    updateFilterCategorySelect();
    
    // 深色模式
    document.getElementById('darkModeBtn').addEventListener('click', toggleDarkMode);
    loadDarkModePreference();
    
    // 表單提交
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);
    
    // 關閉彈窗
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    
    // 點擊背景關閉彈窗
    document.getElementById('taskModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    document.getElementById('categoryModal').addEventListener('click', function(e) {
        if (e.target === this) closeCategoryModal();
    });
});

// ============ 衝突檢測 ============
function validateTaskDependencies(taskId = null) {
    const errors = [];
    
    tasks.forEach(task => {
        // 跳過指定檢查的任務以外的（若有指定）
        if (taskId && task.id !== taskId) return;
        
        // 1. 檢查自我依賴
        if (task.dependencies === task.id) {
            errors.push({
                taskId: task.id,
                type: 'self-dependency',
                message: `❌ ${task.name}: 不能依賴於自己`
            });
        }
        
        // 2. 檢查日期衝突
        if (task.start && task.end) {
            const start = new Date(task.start);
            const end = new Date(task.end);
            if (start > end) {
                errors.push({
                    taskId: task.id,
                    type: 'date-conflict',
                    message: `⚠️ ${task.name}: 開始日期晚於結束日期`
                });
            }
        }
        
        // 3. 檢查循環依賴
        if (task.dependencies) {
            const hasCycle = checkCyclicDependency(task.id, task.dependencies, new Set());
            if (hasCycle) {
                errors.push({
                    taskId: task.id,
                    type: 'cyclic-dependency',
                    message: `🔄 ${task.name}: 存在循環依賴關係`
                });
            }
        }
        
        // 4. 檢查前置任務的結束日期是否晚於此任務的開始日期
        if (task.dependencies) {
            const depTask = tasks.find(t => t.id === task.dependencies);
            if (depTask && depTask.end && task.start) {
                const depEnd = new Date(depTask.end);
                const thisStart = new Date(task.start);
                if (depEnd > thisStart) {
                    errors.push({
                        taskId: task.id,
                        type: 'timeline-conflict',
                        message: `📅 ${task.name}: 前置任務「${depTask.name}」結束時間晚於此任務開始時間`
                    });
                }
            }
        }
    });
    
    return errors;
}

function checkCyclicDependency(currentTaskId, dependsOnTaskId, visited) {
    if (visited.has(dependsOnTaskId)) {
        return true; // 循環檢測到
    }
    
    visited.add(dependsOnTaskId);
    
    const depTask = tasks.find(t => t.id === dependsOnTaskId);
    if (!depTask || !depTask.dependencies) {
        return false;
    }
    
    if (depTask.dependencies === currentTaskId) {
        return true; // 形成循環
    }
    
    return checkCyclicDependency(currentTaskId, depTask.dependencies, visited);
}

function displayValidationErrors(errors) {
    if (errors.length === 0) return;
    
    const errorHtml = errors.map(e => `<li>${e.message}</li>`).join('');
    const errorList = `<ul style="margin: 10px 0; padding-left: 20px;">${errorHtml}</ul>`;
    
    // 在彈窗頂部顯示警告
    let warningEl = document.getElementById('taskValidationWarning');
    if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.id = 'taskValidationWarning';
        const modalContent = document.querySelector('.modal-content');
        modalContent.insertBefore(warningEl, modalContent.firstChild);
    }
    
    warningEl.innerHTML = `
        <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 12px 15px; margin-bottom: 15px;">
            <strong style="color: #856404;">⚠️ 檢測到以下問題：</strong>
            ${errorList}
        </div>
    `;
}

function clearValidationErrors() {
    const warningEl = document.getElementById('taskValidationWarning');
    if (warningEl) {
        warningEl.innerHTML = '';
    }
}

// ============ 雙擊編輯 & 甘特圖交互 ============
function setupGanttInteraction() {
    const ganttWrapper = document.getElementById('ganttWrapper');
    
    ganttWrapper.addEventListener('dblclick', function(e) {
        const svgEl = ganttWrapper.querySelector('svg');
        if (!svgEl) return;
        
        const bars = svgEl.querySelectorAll('.bar-wrapper');
        let found = null;
        
        for (const bar of bars) {
            const rect = bar.querySelector('.bar');
            if (!rect) continue;
            const bbox = rect.getBoundingClientRect();
            if (e.clientX >= bbox.left && e.clientX <= bbox.right &&
                e.clientY >= bbox.top && e.clientY <= bbox.bottom) {
                found = bar;
                break;
            }
        }
        
        if (found) {
            const taskId = found.getAttribute('data-id');
            editTask(taskId);
        }
    });
}

// ============ 計算剩餘天數 ============
function calculateDaysRemaining(endDate) {
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

function getUrgencyLevel(daysRemaining) {
    if (daysRemaining < 0) return { level: 'overdue', label: '逾期', emoji: '🔴' };
    if (daysRemaining === 0) return { level: 'today', label: '今天', emoji: '🔴' };
    if (daysRemaining <= 3) return { level: 'critical', label: '緊急', emoji: '🟠' };
    if (daysRemaining <= 7) return { level: 'warning', label: '本週', emoji: '🟡' };
    return { level: 'normal', label: '正常', emoji: '🟢' };
}

// ============ 鍵盤快捷鍵 ============
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
        closeCategoryModal();
    }
    
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('addTaskBtn').click();
    }
    
    // Ctrl+L 切換鎖定 - 已移除
    // 甘特圖現在永久唯讀
});

// ============ 全局 API - 設置頁面標題 ============
window.setPageTitle = function(title, subtitle) {
    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');
    
    if (titleEl && title) {
        titleEl.textContent = title;
    }
    
    if (subtitleEl && subtitle !== undefined) {
        subtitleEl.textContent = subtitle;
        // 如果為空字符串，隱藏副標題
        if (subtitle === '') {
            subtitleEl.style.display = 'none';
        } else {
            subtitleEl.style.display = 'block';
        }
    }
};

// ============ 全局 API - 獲取當前標題 ============
window.getPageTitle = function() {
    return {
        title: document.getElementById('pageTitle')?.textContent || '',
        subtitle: document.getElementById('pageSubtitle')?.textContent || ''
    };
};
