// Groups Management Page Component
class GroupsManagementPage {
    constructor(selectedTeacherId = null) {
        console.log('=== NEW GroupsManagementPage CREATED ===');
        console.log('Initial teacherId:', selectedTeacherId);
        
        this.selectedTeacher = selectedTeacherId;
        this.teachers = [];
        this.allGroups = [];
        this.teacherGroups = [];
        this.loading = true;
        this.container = null;
    }

    async loadData() {
        try {
            this.loading = true;

            // Загружаем данные параллельно
            const [teachers, allGroups] = await Promise.all([
                FirebaseService.getTeachers(),
                FirebaseService.getGroups()
            ]);

            this.teachers = teachers;
            this.allGroups = allGroups;

            // Если не передан selectedTeacher, берем первого преподавателя
            if (!this.selectedTeacher && this.teachers.length > 0) {
                this.selectedTeacher = this.teachers[0].id;
            }

            // Загружаем группы для выбранного преподавателя
            await this.loadTeacherGroups();

            this.loading = false;
        } catch (error) {
            console.error('Error loading data:', error);
            this.loading = false;
        }
    }

    async loadTeacherGroups() {
        if (!this.selectedTeacher) return;

        try {
            const teacherGroupsData = await FirebaseService.getTeacherGroups(this.selectedTeacher);
            const groupIds = Object.keys(teacherGroupsData);
            this.teacherGroups = this.allGroups.filter(group => groupIds.includes(group.id));
        } catch (error) {
            console.error('Error loading teacher groups:', error);
            this.teacherGroups = [];
        }
    }

    async handleAddGroup(groupId) {
        try {
            await FirebaseService.addGroupToTeacher(this.selectedTeacher, groupId);
            await this.loadTeacherGroups();
            this.renderContent();
        } catch (error) {
            console.error('Error adding group to teacher:', error);
            alert('Ошибка при добавлении группы');
        }
    }

    async handleRemoveGroup(groupId) {
        try {
            await FirebaseService.removeGroupFromTeacher(this.selectedTeacher, groupId);
            await this.loadTeacherGroups();
            this.renderContent();
        } catch (error) {
            console.error('Error removing group from teacher:', error);
            alert('Ошибка при удалении группы');
        }
    }

    async handleTeacherChange(newTeacherId) {
        console.log('=== TEACHER CHANGED ===');
        console.log('From:', this.selectedTeacher);
        console.log('To:', newTeacherId);

        this.selectedTeacher = newTeacherId;
        this.loading = true;
        this.renderContent(); // Показываем загрузку

        await this.loadTeacherGroups();
        this.loading = false;
        this.renderContent();
    }

    getSelectedTeacher() {
        return this.teachers.find(teacher => teacher.id === this.selectedTeacher);
    }

    getAvailableGroups() {
        return this.allGroups.filter(
            group => !this.teacherGroups.some(teacherGroup => teacherGroup.id === group.id)
        );
    }

    renderContent() {
        if (!this.container) return;

        const selectedTeacher = this.getSelectedTeacher();
        const availableGroups = this.getAvailableGroups();

        if (this.loading) {
            this.container.innerHTML = `
                <h2 class="page-title">Управление группами преподавателя</h2>
                <div class="loading">Загрузка данных...</div>
            `;
            return;
        }

        if (!selectedTeacher) {
            this.container.innerHTML = `
                <h2 class="page-title">Управление группами преподавателя</h2>
                <div class="no-data">Преподаватель не найден</div>
            `;
            return;
        }

        this.container.innerHTML = this.getContentHTML(selectedTeacher, availableGroups);
        this.attachEventListeners();
    }

    getContentHTML(selectedTeacher, availableGroups) {
        return `
            <h2 class="page-title">Управление группами преподавателя</h2>

            <div class="teacher-selector">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Выберите преподавателя:</label>
                <select class="teacher-select" id="teacherSelect">
                    ${this.teachers.map(teacher => `
                        <option value="${teacher.id}" ${this.selectedTeacher === teacher.id ? 'selected' : ''}>
                            ${teacher.name} - ${teacher.position}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div style="background: var(--lighter-blue); padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid var(--light-blue);">
                <div style="font-size: 18px; font-weight: 600; color: var(--primary-blue); margin-bottom: 8px;">
                    ${selectedTeacher.name}
                </div>
                <div style="font-size: 14px; color: var(--dark-gray);">
                    <strong>Должность:</strong> ${selectedTeacher.position}<br>
                    <strong>Подключено групп:</strong> <span style="color: var(--primary-blue); font-weight: 600;">${this.teacherGroups.length}</span>
                </div>
            </div>

            <div class="groups-management">
                <div class="groups-section">
                    <h3 class="section-title">
                        📚 Подключенные группы
                        <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 14px; margin-left: 8px;">
                            ${this.teacherGroups.length}
                        </span>
                    </h3>
                    <div class="groups-list" id="teacherGroupsList">
                        ${this.teacherGroups.length > 0 ?
                            this.teacherGroups.map(group => `
                                <div class="group-item">
                                    <div>
                                        <div class="group-name">${group.name}</div>
                                        <div style="font-size: 12px; color: var(--dark-gray); margin-top: 4px;">
                                            👥 Студентов: ${group.students}
                                        </div>
                                    </div>
                                    <button class="action-btn remove" data-group-id="${group.id}">
                                        ❌ Удалить
                                    </button>
                                </div>
                            `).join('') :
                            '<div class="no-data">Нет подключенных групп</div>'
                        }
                    </div>
                </div>

                <div class="groups-section">
                    <h3 class="section-title">
                        📋 Все группы
                        <span style="background: var(--light-blue); color: white; padding: 2px 8px; border-radius: 12px; font-size: 14px; margin-left: 8px;">
                            ${availableGroups.length}
                        </span>
                    </h3>
                    <div class="groups-list" id="allGroupsList">
                        ${availableGroups.length > 0 ?
                            availableGroups.map(group => `
                                <div class="group-item">
                                    <div>
                                        <div class="group-name">${group.name}</div>
                                        <div style="font-size: 12px; color: var(--dark-gray); margin-top: 4px;">
                                            👥 Студентов: ${group.students}
                                        </div>
                                    </div>
                                    <button class="action-btn" data-group-id="${group.id}">
                                        ✅ Добавить
                                    </button>
                                </div>
                            `).join('') :
                            '<div class="no-data">Нет доступных групп для подключения</div>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (!this.container) return;

        // Обработчик для выпадающего списка преподавателей
        const teacherSelect = this.container.querySelector('#teacherSelect');
        if (teacherSelect) {
            teacherSelect.addEventListener('change', (e) => {
                console.log('Dropdown changed to:', e.target.value);
                this.handleTeacherChange(e.target.value);
            });
        }

        // Обработчики для кнопок удаления
        const removeButtons = this.container.querySelectorAll('.action-btn.remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const groupId = e.target.getAttribute('data-group-id');
                console.log('Remove group:', groupId);
                this.handleRemoveGroup(groupId);
            });
        });

        // Обработчики для кнопок добавления
        const addButtons = this.container.querySelectorAll('#allGroupsList .action-btn');
        addButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const groupId = e.target.getAttribute('data-group-id');
                console.log('Add group:', groupId);
                this.handleAddGroup(groupId);
            });
        });
    }

    async render() {
        this.container = document.createElement('div');
        this.container.className = 'container';

        // Показываем загрузку
        this.container.innerHTML = `
            <h2 class="page-title">Управление группами преподавателя</h2>
            <div class="loading">Загрузка данных...</div>
        `;

        // Загружаем данные и рендерим контент
        await this.loadData();
        this.renderContent();
        
        return this.container;
    }
}