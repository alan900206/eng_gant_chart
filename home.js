// 甘特圖首頁邏輯

// ============ 項目配置 ============
const DEFAULT_PROJECTS = [
    {
        id: 'english-q2q4',
        icon: '📚',
        name: '英文口說課程專案',
        description: 'Q2 (3-5月) → Q3 (6-8月) → Q4 (9-11月) 課程規劃甘特圖'
    },
    {
        id: 'math-courses',
        icon: '🔢',
        name: '數學課程教學計劃',
        description: '代數 (1-3月) → 幾何 (4-6月) → 微積分 (7-9月)'
    },
    {
        id: 'design-system',
        icon: '🎨',
        name: '設計系統建置',
        description: 'UI/UX 開發流程 - 規劃 → 設計 → 開發 → 測試'
    },
    {
        id: 'software-lifecycle',
        icon: '🏗️',
        name: '軟體開發生命週期',
        description: '需求分析 → 開發 → 測試 → 上線'
    }
];

let PROJECTS = [];

// ============ 頁面初始化 ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 首頁初始化開始');
    
    // 加載項目列表
    loadProjects();
    
    // 渲染項目卡片
    renderProjectCards();
    
    // 設置事件監聽
    setupEventListeners();
});

// ============ 項目管理 ============
function loadProjects() {
    const saved = localStorage.getItem('ganttProjectsList');
    if (saved) {
        try {
            PROJECTS = JSON.parse(saved);
        } catch (e) {
            console.error('加載項目列表失敗:', e);
            PROJECTS = [...DEFAULT_PROJECTS];
        }
    } else {
        // 首次使用，使用預設項目
        PROJECTS = [...DEFAULT_PROJECTS];
        saveProjects();
    }
}

function saveProjects() {
    localStorage.setItem('ganttProjectsList', JSON.stringify(PROJECTS));
}

function addProject(name, description, icon) {
    if (!name.trim()) {
        alert('專案名稱不能為空');
        return false;
    }
    
    // 生成唯一的 ID
    const timestamp = Date.now();
    const id = `project-${timestamp}`;
    
    const newProject = {
        id: id,
        icon: icon || '📌',
        name: name.trim(),
        description: description.trim()
    };
    
    PROJECTS.push(newProject);
    saveProjects();
    
    console.log(`✅ 新增項目: ${name}`);
    return true;
}

function deleteProject(id) {
    const project = PROJECTS.find(p => p.id === id);
    if (!project) return false;
    
    if (confirm(`確定要刪除 "${project.name}" 嗎？此操作無法復原。`)) {
        PROJECTS = PROJECTS.filter(p => p.id !== id);
        saveProjects();
        console.log(`✅ 刪除項目: ${project.name}`);
        return true;
    }
    return false;
}

// ============ 事件監聽設置 ============
function setupEventListeners() {
    // 新增按鈕
    document.getElementById('addProjectBtn').addEventListener('click', openModal);
    
    // 模態彈窗關閉
    document.getElementById('closeProjectModal').addEventListener('click', closeModal);
    document.getElementById('cancelProjectBtn').addEventListener('click', closeModal);
    
    // 表單提交
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
    
    // 點擊背景關閉模態
    document.getElementById('projectModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

function openModal() {
    document.getElementById('projectModal').classList.add('open');
    document.getElementById('projectForm').reset();
}

function closeModal() {
    document.getElementById('projectModal').classList.remove('open');
}

function handleProjectSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;
    const icon = document.getElementById('projectIcon').value || '📌';
    
    if (addProject(name, description, icon)) {
        closeModal();
        renderProjectCards();
    }
}

// ============ 渲染項目卡片 ============
function renderProjectCards() {
    const grid = document.getElementById('ganttGrid');
    grid.innerHTML = '';
    
    PROJECTS.forEach(project => {
        const card = document.createElement('div');
        card.className = 'gantt-card';
        card.innerHTML = `
            <button class="gantt-card-delete" data-id="${project.id}" title="刪除">✕</button>
            <div class="gantt-card-icon">${project.icon}</div>
            <h3 class="gantt-card-title">${project.name}</h3>
            <p class="gantt-card-description">${project.description}</p>
            <a href="gantt.html?id=${project.id}" class="gantt-card-link">
                進入甘特圖
                <span>➜</span>
            </a>
        `;
        
        // 卡片點擊進入甘特圖
        card.addEventListener('click', function(e) {
            if (e.target.classList.contains('gantt-card-delete')) return;
            window.location.href = `gantt.html?id=${project.id}`;
        });
        
        // 刪除按鈕
        const deleteBtn = card.querySelector('.gantt-card-delete');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            if (deleteProject(id)) {
                renderProjectCards();
            }
        });
        
        grid.appendChild(card);
    });
    
    console.log(`✅ 已渲染 ${PROJECTS.length} 個項目卡片`);
}
