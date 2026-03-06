// 英文口說課程專案甘特圖 - 主要應用程式邏輯

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
        dependencies: ''
    },
    {
        id: 'task-1771921216957',
        name: '調查Q2學生是否續上',
        start: '2026-04-13',
        end: '2026-04-17',
        category: 'milestone',
        dependencies: ''
    },
    {
        id: 'task-1771921303107',
        name: '安排Q3前測',
        start: '2026-04-20',
        end: '2026-04-25',
        category: 'q3-prep',
        dependencies: ''
    },
    {
        id: 'task-1771921372123',
        name: '回收Q3學生上課意願',
        start: '2026-04-13',
        end: '2026-04-17',
        category: 'q3-prep',
        dependencies: ''
    },
    {
        id: 'task-1771921464963',
        name: '預計Q3開課',
        start: '2026-06-09',
        end: '2026-06-09',
        category: 'milestone',
        dependencies: ''
    },
    {
        id: 'task-1771921493547',
        name: '預計Q3結束',
        start: '2026-08-21',
        end: '2026-08-21',
        category: 'milestone',
        dependencies: ''
    },
    {
        id: 'task-1771921527863',
        name: '預計Q4開課',
        start: '2026-09-08',
        end: '2026-09-08',
        category: 'milestone',
        dependencies: ''
    },
    {
        id: 'task-1771921655597',
        name: '預計Q4結束',
        start: '2026-11-20',
        end: '2026-11-20',
        category: 'milestone',
        dependencies: ''
    }
];

// ============ 全域變數 ============
let gantt;
let currentViewMode = 'Day';
let editingTaskId = null;
let isLocked = true;

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
            notes: notes
        };
        tasks.push(newTask);
    }
    
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
    const data = {
        tasks: tasks,
        categories: categories
    };
    localStorage.setItem('engCourseGantt_v2', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('engCourseGantt_v2');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.tasks) tasks = data.tasks;
        if (data.categories) categories = data.categories;
    }
}

// ============ 匯出資料 ============
function exportData() {
    const data = {
        tasks: tasks,
        categories: categories,
        exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `英文口說課程甘特圖_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    
    // 顯示日期範圍
    const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    dateRangeEl.textContent = `${fmt(start)} (一) ~ ${fmt(end)} (日)`;
    
    // 分類任務
    const starting = [];  // 本週開始
    const ongoing = [];   // 進行中（跨週）
    const ending = [];    // 本週結束
    
    tasks.forEach(task => {
        const taskStart = new Date(task.start);
        const taskEnd = new Date(task.end);
        taskStart.setHours(0, 0, 0, 0);
        taskEnd.setHours(23, 59, 59, 999);
        
        // 任務與本週有交集
        if (taskStart <= end && taskEnd >= start) {
            const startsThisWeek = taskStart >= start && taskStart <= end;
            const endsThisWeek = taskEnd >= start && taskEnd <= end;
            
            if (startsThisWeek && endsThisWeek) {
                starting.push({ ...task, badge: 'starting', badgeText: '本週開始＆結束' });
            } else if (startsThisWeek) {
                starting.push({ ...task, badge: 'starting', badgeText: '本週開始' });
            } else if (endsThisWeek) {
                ending.push({ ...task, badge: 'ending', badgeText: '本週截止' });
            } else {
                ongoing.push({ ...task, badge: 'ongoing', badgeText: '進行中' });
            }
        }
    });
    
    let html = '';
    
    if (starting.length === 0 && ongoing.length === 0 && ending.length === 0) {
        html = '<div class="weekly-empty">🎉 本週沒有任務</div>';
    } else {
        if (starting.length > 0) {
            html += renderWeeklySection('🚀 開始', starting);
        }
        if (ongoing.length > 0) {
            html += renderWeeklySection('🔄 進行中', ongoing);
        }
        if (ending.length > 0) {
            html += renderWeeklySection('🏁 截止', ending);
        }
    }
    
    listEl.innerHTML = html;
}

function renderWeeklySection(title, taskList) {
    let html = `<div class="weekly-section">
        <div class="weekly-section-title">${title}</div>`;
    
    taskList.forEach(task => {
        const cat = categories[task.category];
        const borderColor = cat ? cat.color : '#667eea';
        const completedClass = task.completed ? ' completed-task' : '';
        
        html += `
            <div class="weekly-task-card${completedClass}" style="border-left-color: ${borderColor};">
                <div class="task-name">${task.completed ? '✅ ' : ''}${task.name}</div>
                <div class="task-date">📅 ${task.start} ~ ${task.end}</div>
                <span class="task-badge ${task.badge}">${task.badgeText}</span>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// ============ 事件監聽器 ============
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    initGantt();
    
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
    
    // 匯出按鈕
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
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
