// Main App Component
class App {
    constructor() {
        this.state = {
            currentPage: 'login',
            isAuthenticated: false,
            selectedTeacherId: null
        };

        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.render();
    }

    checkAuthStatus() {
        const user = localStorage.getItem('adminUser');
        if (user) {
            this.setState({
                isAuthenticated: true,
                currentPage: 'teachers'
            });
        }
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    handleLogin(login, password) {
        const ADMIN_LOGIN = "admin";
        const ADMIN_PASSWORD = "admin123";

        if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
            this.setState({
                isAuthenticated: true,
                currentPage: 'teachers'
            });
            localStorage.setItem('adminUser', 'authenticated');
            return true;
        }
        return false;
    }

    handleLogout() {
        this.setState({
            isAuthenticated: false,
            currentPage: 'login',
            selectedTeacherId: null
        });
        localStorage.removeItem('adminUser');
    }

    handleTeacherSelect(teacherId) {
        console.log('Teacher selected:', teacherId);
        this.setState({
            currentPage: 'groups',
            selectedTeacherId: teacherId
        });
    }

    render() {
        const root = document.getElementById('root');
        root.innerHTML = '';

        if (this.state.isAuthenticated) {
            const header = new Header(this.state.currentPage, (page) => {
                this.setState({ currentPage: page });
            }, () => this.handleLogout());
            root.appendChild(header.render());
        }

        const mainContent = new MainContent(
            this.state.currentPage,
            (page) => this.setState({ currentPage: page }),
            (login, password) => this.handleLogin(login, password),
            this.state.isAuthenticated,
            this.state.selectedTeacherId,
            (teacherId) => this.handleTeacherSelect(teacherId)
        );
        root.appendChild(mainContent.render());
    }
}

// Header Component
class Header {
    constructor(currentPage, onPageChange, onLogout) {
        this.currentPage = currentPage;
        this.onPageChange = onPageChange;
        this.onLogout = onLogout;
    }

    render() {
        const header = document.createElement('header');
        header.className = 'header';
        header.innerHTML = `
            <div class="container">
                <div class="header-content">
                    <div class="logo">УГНТУ</div>
                    <div class="header-text">
                        <h1>УГНТУ, Кафедра иностранных языков</h1>
                        <p>Панель администратора</p>
                    </div>
                </div>
            </div>
            <nav class="nav">
                <div class="container">
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="#teachers" class="nav-link ${this.currentPage === 'teachers' ? 'active' : ''}">Преподаватели</a>
                        </li>
                        <li class="nav-item">
                            <a href="#groups" class="nav-link ${this.currentPage === 'groups' ? 'active' : ''}">Управление группами</a>
                        </li>
                        <li class="nav-item" style="margin-left: auto;">
                            <a href="#logout" class="nav-link">Выйти</a>
                        </li>
                    </ul>
                </div>
            </nav>
        `;

        const teachersLink = header.querySelector('a[href="#teachers"]');
        const groupsLink = header.querySelector('a[href="#groups"]');
        const logoutLink = header.querySelector('a[href="#logout"]');

        teachersLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.onPageChange('teachers');
        });

        groupsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.onPageChange('groups');
        });

        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.onLogout();
        });

        return header;
    }
}

// Main Content Component
class MainContent {
    constructor(currentPage, onPageChange, onLogin, isAuthenticated, selectedTeacherId, onTeacherSelect) {
        this.currentPage = currentPage;
        this.onPageChange = onPageChange;
        this.onLogin = onLogin;
        this.isAuthenticated = isAuthenticated;
        this.selectedTeacherId = selectedTeacherId;
        this.onTeacherSelect = onTeacherSelect;
    }

    render() {
        const mainContent = document.createElement('main');
        mainContent.className = 'main-content';

        if (!this.isAuthenticated) {
            const loginPage = new LoginPage(this.onLogin);
            mainContent.appendChild(loginPage.render());
        } else {
            switch(this.currentPage) {
                case 'teachers':
                    const teachersPage = new TeachersPage(this.onTeacherSelect);
                    // Ждем завершения рендеринга
                    teachersPage.render().then(element => {
                        mainContent.appendChild(element);
                    });
                    break;
                case 'groups':
                    const groupsPage = new GroupsManagementPage(this.selectedTeacherId);
                    // Ждем завершения рендеринга
                    groupsPage.render().then(element => {
                        mainContent.appendChild(element);
                    });
                    break;
                default:
                    const defaultPage = new TeachersPage(this.onTeacherSelect);
                    // Ждем завершения рендеринга
                    defaultPage.render().then(element => {
                        mainContent.appendChild(element);
                    });
            }
        }

        return mainContent;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});