// Teachers Page Component
class TeachersPage {
    constructor(onTeacherSelect) {
        this.onTeacherSelect = onTeacherSelect;
        this.teachers = [];
        this.container = null;
        this.loading = true;
        this.initializeEmailJS();
    }

    initializeEmailJS() {
            try {
                // Инициализируем с вашим Public Key
                emailjs.init("YTaeAMsQWBDv28dNQ");
                console.log('EmailJS успешно инициализирован');
                return true;
            } catch (error) {
                console.error('Ошибка инициализации EmailJS:', error);
                return false;
            }
        }

    async loadTeachers() {
        try {
            this.loading = true;
            this.teachers = await FirebaseService.getTeachers();
            this.teachers.sort((a, b) => a.name.localeCompare(b.name));
            this.loading = false;
        } catch (error) {
            console.error('Error loading teachers:', error);
            this.loading = false;
        }
    }

    async handleViewGroups(teacherId) {
        console.log('View groups clicked for teacher:', teacherId);
        this.onTeacherSelect(teacherId);
    }

    handleAddTeacher() {
        this.showAddTeacherModal();
    }

    showAddTeacherModal() {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Добавить преподавателя</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addTeacherForm">
                        <div class="form-group">
                            <label class="form-label">ФИО преподавателя *</label>
                            <input type="text" class="form-input" id="teacherName" required
                                   placeholder="Введите полное ФИО">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Должность *</label>
                            <select class="form-input" id="teacherPosition" required>
                                <option value="">Выберите должность</option>
                                <option value="Профессор">Профессор</option>
                                <option value="Доцент">Доцент</option>
                                <option value="Старший преподаватель">Старший преподаватель</option>
                                <option value="Преподаватель">Преподаватель</option>
                                <option value="Ассистент">Ассистент</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email *</label>
                            <input type="email" class="form-input" id="teacherEmail" required
                                   placeholder="email@ugntu.ru">
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" id="cancelBtn">Отмена</button>
                            <button type="submit" class="btn btn-primary">Добавить преподавателя</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработчики событий для модального окна
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#cancelBtn');
        const form = modal.querySelector('#addTeacherForm');

        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmitNewTeacher(form);
            closeModal();
        });

        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    async handleSubmitNewTeacher(form) {
        const name = form.querySelector('#teacherName').value.trim();
        const position = form.querySelector('#teacherPosition').value;
        const email = form.querySelector('#teacherEmail').value.trim();

        if (!name || !position || !email) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Проверяем email
        if (!this.isValidEmail(email)) {
            alert('Пожалуйста, введите корректный email адрес');
            return;
        }

        // Проверяем, нет ли уже преподавателя с таким email
        if (this.teachers.some(teacher => teacher.email === email)) {
            alert('Преподаватель с таким email уже существует');
            return;
        }

        try {
            //Генерируем пароль преподавателю
            const generatedPassword = this.generatePassword(12);
            // Создаем нового преподавателя
            const newTeacher = {
                id: Date.now().toString(), // Генерируем уникальный ID
                name: name,
                position: position,
                email: email,
                groupCount: 0,
                password: generatedPassword
            };
            //Отправляем e-mail добавленному преподавателю
            await this.sendTeacherCredentials(email, name, generatedPassword);

            // Добавляем в базу данных
            await FirebaseService.addTeacher(newTeacher);

            // Перезагружаем список преподавателей
            await this.loadTeachers();
            this.renderContent();

            alert('Преподаватель успешно добавлен!');
        } catch (error) {
            console.error('Error adding teacher:', error);
            alert('Ошибка при добавлении преподавателя');
        }
    }


generatePassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Гарантируем хотя бы один символ каждого типа
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Заполняем остаток пароля
    for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Перемешиваем символы для большей безопасности
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

async sendTeacherCredentials(email, teacherName, password) {
        try {
            // Проверяем, инициализирован ли EmailJS
            if (typeof emailjs === 'undefined' || !emailjs) {
                console.error('EmailJS не инициализирован');
                return false;
            }

            const templateParams = {
                to_email: email,
                teacher_name: teacherName,
                password: password,
                department_name: 'Кафедра английского языка',
                current_year: new Date().getFullYear(),
                generated_time: new Date().toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            console.log('Отправка email с параметрами:', templateParams);

            // Отправляем email через EmailJS
            const response = await emailjs.send(
                'service_ncw87st',     // Ваш Service ID
                'template_5ssx3rr',    // Ваш Template ID
                templateParams
            );

            console.log('EmailJS Response:', response);

            if (response.status === 200 || response.status === 0) {
                console.log(`✅ Email успешно отправлен на ${email}`);
                return true;
            } else {
                console.error(`❌ Ошибка отправки email: ${response.status}`);
                return false;
            }

        } catch (error) {
            console.error('❌ Ошибка отправки email:', error);

            // Выводим детальную информацию об ошибке
            console.log('=== ДЕТАЛИ ОШИБКИ EMAIL ===');
            console.log('Преподаватель:', teacherName);
            console.log('Email:', email);
            console.log('Пароль:', password);
            console.log('Время ошибки:', new Date().toISOString());
            console.log('Текст ошибки:', error.text || error.message);
            console.log('=========================');

            // Показываем уведомление об ошибке администратору
            this.showEmailErrorNotification(teacherName, email, password, error);

            return false;
        }
    }



    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async handleDeleteTeacher(teacherId, teacherName) {
        if (confirm(`Вы уверены, что хотите удалить преподавателя "${teacherName}"?`)) {
            try {
                await FirebaseService.deleteTeacher(teacherId);
                await this.loadTeachers();
                this.renderContent();
                alert('Преподаватель успешно удален!');
            } catch (error) {
                console.error('Error deleting teacher:', error);
                alert('Ошибка при удалении преподавателя');
            }
        }
    }

    renderContent() {
        if (!this.container) return;

        if (this.loading) {
            this.container.innerHTML = `
                <h2 class="page-title">Список преподавателей</h2>
                <div class="loading">Загрузка данных...</div>
            `;
            return;
        }

        this.container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 class="page-title">Список преподавателей</h2>
                <button class="btn btn-primary" id="addTeacherBtn">
                    + Добавить преподавателя
                </button>
            </div>
            <div class="teachers-list" id="teachersList">
                ${this.teachers.length > 0 ?
                    this.teachers.map(teacher => `
                        <div class="teacher-card">
                            <div class="teacher-header">
                                <div class="teacher-name">${teacher.name}</div>
                                <div class="teacher-position">${teacher.position}</div>
                            </div>
                            <div class="teacher-info">
                                <div class="teacher-email">${teacher.email}</div>
                            </div>
                            <div class="teacher-groups">
                                <div class="groups-count">
                                    <strong>Количество учебных групп:</strong> ${teacher.groupCount || 0}
                                </div>
                                <div class="teacher-actions">
                                    <button class="view-groups-btn" data-teacher-id="${teacher.id}">
                                        Управление группами
                                    </button>
                                    <button class="delete-teacher-btn" data-teacher-id="${teacher.id}" data-teacher-name="${teacher.name}">
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('') :
                    '<div class="no-data">Нет преподавателей. Добавьте первого преподавателя.</div>'
                }
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        if (!this.container) return;

        // Кнопка добавления преподавателя
        const addTeacherBtn = this.container.querySelector('#addTeacherBtn');
        if (addTeacherBtn) {
            addTeacherBtn.addEventListener('click', () => {
                this.handleAddTeacher();
            });
        }

        // Кнопки управления группами
        const viewGroupsBtns = this.container.querySelectorAll('.view-groups-btn');
        viewGroupsBtns.forEach(button => {
            button.addEventListener('click', (e) => {
                const teacherId = e.target.getAttribute('data-teacher-id');
                this.handleViewGroups(teacherId);
            });
        });

        // Кнопки удаления преподавателей
        const deleteTeacherBtns = this.container.querySelectorAll('.delete-teacher-btn');
        deleteTeacherBtns.forEach(button => {
            button.addEventListener('click', (e) => {
                const teacherId = e.target.getAttribute('data-teacher-id');
                const teacherName = e.target.getAttribute('data-teacher-name');
                this.handleDeleteTeacher(teacherId, teacherName);
            });
        });
    }

    async render() {
        this.container = document.createElement('div');
        this.container.className = 'container';

        // Показываем загрузку
        this.container.innerHTML = `
            <h2 class="page-title">Список преподавателей</h2>
            <div class="loading">Загрузка данных...</div>
        `;

        // Загружаем данные и рендерим контент
        await this.loadTeachers();
        this.renderContent();
        
        return this.container;
    }
}