/**
 * TaskFlow Pro - Módulo de Proyectos & Extensión "Solo Mis tareas"
 * Lógica principal del frontend
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // Base State & Mock Data
    // =========================================================================

    const USERS = [
        { id: '1', name: 'Carlos Mendoza', initials: 'CM', role: 'Diseñador Lead & UX Architect', only_my_tasks: false },
        { id: '2', name: 'Ana Gómez', initials: 'AG', role: 'Dev Frontend Specialist', only_my_tasks: true },
        { id: '3', name: 'Roberto Silva', initials: 'RS', role: 'PM & Dev Backend Lead', only_my_tasks: false },
        { id: '4', name: 'Laura Torrez', initials: 'LT', role: 'QA Automation Engineer', only_my_tasks: false }
    ];

    let tasks = [
        {
            id: 'T-101',
            title: 'Diseñar Maqueta UI para Modal de Ajustes del Usuario',
            project: 'web',
            projectName: 'Rediseño Web Portal',
            assigneeId: '1',
            assigneeName: 'Carlos Mendoza',
            assigneeInitials: 'CM',
            status: 'in_progress',
            priority: 'Alta',
            dueDate: '2026-08-10'
        },
        {
            id: 'T-102',
            title: 'Implementar Regla de Seguridad ir.rule en Odoo',
            project: 'erp',
            projectName: 'Integración ERP Odoo',
            assigneeId: '3',
            assigneeName: 'Roberto Silva',
            assigneeInitials: 'RS',
            status: 'todo',
            priority: 'Alta',
            dueDate: '2026-08-12'
        },
        {
            id: 'T-103',
            title: 'Crear Componente de Filtro Reactivo "Solo Mis tareas"',
            project: 'web',
            projectName: 'Rediseño Web Portal',
            assigneeId: '2',
            assigneeName: 'Ana Gómez',
            assigneeInitials: 'AG',
            status: 'in_progress',
            priority: 'Alta',
            dueDate: '2026-08-08'
        },
        {
            id: 'T-104',
            title: 'Pruebas E2E de Permisos de Usuario y Filtrado de Tareas',
            project: 'mobile',
            projectName: 'App Móvil v2',
            assigneeId: '4',
            assigneeName: 'Laura Torrez',
            assigneeInitials: 'LT',
            status: 'in_review',
            priority: 'Media',
            dueDate: '2026-08-15'
        },
        {
            id: 'T-105',
            title: 'Optimización de Consultas SQL en Módulo res.users',
            project: 'erp',
            projectName: 'Integración ERP Odoo',
            assigneeId: '3',
            assigneeName: 'Roberto Silva',
            assigneeInitials: 'RS',
            status: 'done',
            priority: 'Baja',
            dueDate: '2026-08-01'
        },
        {
            id: 'T-106',
            title: 'Refactorización de Interfaz Dark Theme Glassmorphism',
            project: 'web',
            projectName: 'Rediseño Web Portal',
            assigneeId: '1',
            assigneeName: 'Carlos Mendoza',
            assigneeInitials: 'CM',
            status: 'todo',
            priority: 'Media',
            dueDate: '2026-08-18'
        },
        {
            id: 'T-107',
            title: 'Integración de Notificaciones Push para Asignaciones',
            project: 'mobile',
            projectName: 'App Móvil v2',
            assigneeId: '2',
            assigneeName: 'Ana Gómez',
            assigneeInitials: 'AG',
            status: 'todo',
            priority: 'Media',
            dueDate: '2026-08-20'
        }
    ];

    // State Variables
    let currentUserId = '1';
    let activeProjectFilter = 'all';
    let searchQuery = '';
    let currentView = 'kanban';

    // =========================================================================
    // DOM Elements
    // =========================================================================

    const userSelect = document.getElementById('user-select');
    const searchInput = document.getElementById('search-input');
    const filterBanner = document.getElementById('filter-banner');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDesc = document.getElementById('banner-desc');
    const quickToggleBtn = document.getElementById('quick-toggle-btn');
    const activeFilterBadge = document.getElementById('active-filter-badge');
    const badgeText = document.getElementById('badge-text');
    const viewStatsSummary = document.getElementById('view-stats-summary');

    // Modals
    const settingsModal = document.getElementById('settings-modal');
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const openSettingsSidebarBtn = document.getElementById('open-settings-sidebar-btn');
    const closeSettingsModal = document.getElementById('close-settings-modal');
    const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Settings Modal Inputs & Buttons
    const modalUserAvatar = document.getElementById('modal-user-avatar');
    const modalUserName = document.getElementById('modal-user-name');
    const modalUserRole = document.getElementById('modal-user-role');
    const btnSoloMisTareas = document.getElementById('btn-solo-mis-tareas');
    const btnSoloMisTareasLabel = document.getElementById('btn-solo-mis-tareas-label');
    const soloTasksStatusPill = document.getElementById('solo-tasks-status-pill');
    const toggleCheckbox = document.getElementById('toggle-only-my-tasks-checkbox');

    // Add Task Modal
    const taskModal = document.getElementById('task-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const closeTaskModal = document.getElementById('close-task-modal');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const createTaskForm = document.getElementById('create-task-form');

    // Views
    const kanbanView = document.getElementById('kanban-view');
    const listView = document.getElementById('list-view');
    const navKanban = document.getElementById('nav-kanban');
    const navList = document.getElementById('nav-list');
    const tasksTableBody = document.getElementById('tasks-table-body');

    // =========================================================================
    // Core Functions
    // =========================================================================

    /**
     * Get Current Active User Object
     */
    function getCurrentUser() {
        return USERS.find(u => u.id === currentUserId) || USERS[0];
    }

    /**
     * Update user settings modal controls state
     */
    function syncSettingsModalState() {
        const user = getCurrentUser();
        modalUserAvatar.textContent = user.initials;
        modalUserName.textContent = user.name;
        modalUserRole.textContent = user.role;

        const isOnlyMyTasksActive = user.only_my_tasks;

        toggleCheckbox.checked = isOnlyMyTasksActive;

        if (isOnlyMyTasksActive) {
            btnSoloMisTareas.classList.add('active-mode');
            btnSoloMisTareasLabel.textContent = 'Solo Mis tareas (ACTIVADO)';
            soloTasksStatusPill.textContent = 'Activo';
            soloTasksStatusPill.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
        } else {
            btnSoloMisTareas.classList.remove('active-mode');
            btnSoloMisTareasLabel.textContent = 'Solo Mis tareas';
            soloTasksStatusPill.textContent = 'Inactivo';
            soloTasksStatusPill.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }
    }

    /**
     * Toggle the "Solo Mis tareas" setting for current user
     */
    function setOnlyMyTasksState(activeState) {
        const user = getCurrentUser();
        user.only_my_tasks = activeState;
        syncSettingsModalState();
        renderTasks();
    }

    /**
     * Main Render Engine for Tasks
     */
    function renderTasks() {
        const user = getCurrentUser();
        const isFilteredByMyTasks = user.only_my_tasks;

        // 1. Filter Tasks
        let filteredTasks = tasks.filter(task => {
            // "Solo Mis tareas" check
            if (isFilteredByMyTasks && task.assigneeId !== currentUserId) {
                return false;
            }

            // Project filter
            if (activeProjectFilter !== 'all' && task.project !== activeProjectFilter) {
                return false;
            }

            // Search query filter
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const matchTitle = task.title.toLowerCase().includes(query);
                const matchProject = task.projectName.toLowerCase().includes(query);
                const matchAssignee = task.assigneeName.toLowerCase().includes(query);
                if (!matchTitle && !matchProject && !matchAssignee) return false;
            }

            return true;
        });

        // 2. Update Header Banner & Badges
        if (isFilteredByMyTasks) {
            filterBanner.classList.remove('hidden');
            bannerTitle.textContent = `Modo 'Solo Mis Tareas' Activo (${user.name})`;
            bannerDesc.textContent = `Mostrando únicamente las tareas asignadas a ${user.name}. Las tareas de otros miembros se ocultan.`;
            quickToggleBtn.innerHTML = `<i class="fa-solid fa-toggle-on"></i> Desactivar Filtro`;

            activeFilterBadge.className = 'filter-badge active';
            badgeText.textContent = `Filtro Activo: Solo Mis Tareas (${user.name})`;
        } else {
            filterBanner.classList.add('hidden');
            activeFilterBadge.className = 'filter-badge inactive';
            badgeText.textContent = `Vista General (Todas las tareas)`;
        }

        // Stats summary
        viewStatsSummary.textContent = `Mostrando ${filteredTasks.length} de ${tasks.length} tareas totales en el sistema.`;

        // 3. Render Kanban Columns
        const columns = ['todo', 'in_progress', 'in_review', 'done'];

        columns.forEach(status => {
            const listEl = document.getElementById(`list-${status}`);
            const countEl = document.getElementById(`count-${status}`);

            const columnTasks = filteredTasks.filter(t => t.status === status);
            countEl.textContent = columnTasks.length;

            if (columnTasks.length === 0) {
                listEl.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-regular fa-folder-open"></i>
                        Sin tareas en esta etapa
                    </div>
                `;
                return;
            }

            listEl.innerHTML = columnTasks.map(task => {
                const isMine = task.assigneeId === currentUserId;
                return `
                    <div class="task-card ${isMine ? 'is-my-task' : ''}" data-task-id="${task.id}">
                        <div class="task-header">
                            <span class="task-project-tag">${task.projectName}</span>
                            <span class="priority-tag ${task.priority.toLowerCase()}">${task.priority}</span>
                        </div>
                        <h4>${escapeHTML(task.title)}</h4>
                        <div class="task-footer">
                            <div class="assignee-info">
                                <div class="avatar-sm" title="${task.assigneeName}">${task.assigneeInitials}</div>
                                <span class="assignee-name">${task.assigneeName}</span>
                            </div>
                            <div class="task-duedate">
                                <i class="fa-regular fa-calendar"></i> ${task.dueDate || 'Sin fecha'}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        });

        // 4. Render Table View
        tasksTableBody.innerHTML = filteredTasks.map(task => `
            <tr>
                <td><strong>${escapeHTML(task.title)}</strong></td>
                <td><span class="task-project-tag">${task.projectName}</span></td>
                <td>
                    <div class="assignee-info">
                        <div class="avatar-sm">${task.assigneeInitials}</div>
                        <span>${task.assigneeName}</span>
                    </div>
                </td>
                <td><span class="priority-tag ${task.priority.toLowerCase()}">${task.status.toUpperCase()}</span></td>
                <td><span class="priority-tag ${task.priority.toLowerCase()}">${task.priority}</span></td>
                <td>${task.dueDate || '-'}</td>
            </tr>
        `).join('');
    }

    /**
     * Escape HTML string helper
     */
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // =========================================================================
    // Event Listeners & Interactions
    // =========================================================================

    // User Switcher (Simulation of logged-in user)
    userSelect.addEventListener('change', (e) => {
        currentUserId = e.target.value;
        syncSettingsModalState();
        renderTasks();
    });

    // Open User Settings Modal
    function openSettings() {
        syncSettingsModalState();
        settingsModal.classList.remove('hidden');
    }

    openSettingsBtn.addEventListener('click', openSettings);
    openSettingsSidebarBtn.addEventListener('click', openSettings);

    // Close Modal Events
    closeSettingsModal.addEventListener('click', () => settingsModal.classList.add('hidden'));
    cancelSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    saveSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
        renderTasks();
    });

    // "Solo Mis tareas" Prominent Button Click inside Modal
    btnSoloMisTareas.addEventListener('click', () => {
        const currentUser = getCurrentUser();
        const newState = !currentUser.only_my_tasks;
        setOnlyMyTasksState(newState);
    });

    // Toggle Checkbox change inside Modal
    toggleCheckbox.addEventListener('change', (e) => {
        setOnlyMyTasksState(e.target.checked);
    });

    // Quick toggle button on Banner
    quickToggleBtn.addEventListener('click', () => {
        const currentUser = getCurrentUser();
        setOnlyMyTasksState(!currentUser.only_my_tasks);
    });

    // Navigation Switcher (Kanban vs List View)
    navKanban.addEventListener('click', (e) => {
        e.preventDefault();
        navKanban.classList.add('active');
        navList.classList.remove('active');
        kanbanView.classList.remove('hidden');
        listView.classList.add('hidden');
    });

    navList.addEventListener('click', (e) => {
        e.preventDefault();
        navList.classList.add('active');
        navKanban.classList.remove('active');
        listView.classList.remove('hidden');
        kanbanView.classList.add('hidden');
    });

    // Project Category Filter Buttons
    document.querySelectorAll('.project-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.project-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeProjectFilter = btn.dataset.project;
            renderTasks();
        });
    });

    // Search Input Event
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTasks();
    });

    // Add Task Modal Events
    addTaskBtn.addEventListener('click', () => taskModal.classList.remove('hidden'));
    closeTaskModal.addEventListener('click', () => taskModal.classList.add('hidden'));
    cancelTaskBtn.addEventListener('click', () => taskModal.classList.add('hidden'));

    saveTaskBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('task-title').value;
        const projectSelect = document.getElementById('task-project');
        const assigneeSelect = document.getElementById('task-assignee');
        const prioritySelect = document.getElementById('task-priority').value;
        const dueDateInput = document.getElementById('task-duedate').value;

        if (!titleInput.trim()) {
            alert('Por favor, ingresa el título de la tarea.');
            return;
        }

        const selectedUser = USERS.find(u => u.id === assigneeSelect.value);
        const projectNameMap = {
            web: 'Rediseño Web Portal',
            mobile: 'App Móvil v2',
            erp: 'Integración ERP Odoo'
        };

        const newTask = {
            id: `T-${Math.floor(100 + Math.random() * 900)}`,
            title: titleInput,
            project: projectSelect.value,
            projectName: projectNameMap[projectSelect.value] || 'Proyecto',
            assigneeId: selectedUser.id,
            assigneeName: selectedUser.name,
            assigneeInitials: selectedUser.initials,
            status: 'todo',
            priority: prioritySelect,
            dueDate: dueDateInput || new Date().toISOString().split('T')[0]
        };

        tasks.unshift(newTask);
        createTaskForm.reset();
        taskModal.classList.add('hidden');
        renderTasks();
    });

    // Initialize App
    syncSettingsModalState();
    renderTasks();
});
