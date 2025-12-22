// Login Page Component
class LoginPage {
    constructor(onLogin) {
        this.onLogin = onLogin;
        this.login = '';
        this.password = '';
        this.error = '';
    }

    handleSubmit(e) {
        e.preventDefault();
        this.error = '';

        if (this.onLogin(this.login, this.password)) {
            // Login successful
        } else {
            this.error = 'Неверный логин или пароль';
            this.render();
        }
    }

    render() {
        const container = document.createElement('div');
        container.className = 'container';

        const loginContainer = document.createElement('div');
        loginContainer.className = 'login-container';
        loginContainer.innerHTML = `
            <h2 class="login-title">Авторизация администратора</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label">Логин</label>
                    <input type="text" class="form-input" id="loginInput" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Пароль</label>
                    <input type="password" class="form-input" id="passwordInput" required>
                </div>
                <button type="submit" class="btn btn-block">Войти</button>
                ${this.error ? `<div class="error-message">${this.error}</div>` : ''}
            </form>
        `;

        container.appendChild(loginContainer);

        // Add event listeners
        const form = container.querySelector('#loginForm');
        const loginInput = container.querySelector('#loginInput');
        const passwordInput = container.querySelector('#passwordInput');

        loginInput.addEventListener('input', (e) => {
            this.login = e.target.value;
        });

        passwordInput.addEventListener('input', (e) => {
            this.password = e.target.value;
        });

        form.addEventListener('submit', (e) => this.handleSubmit(e));

        return container;
    }
}