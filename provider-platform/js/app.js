// ========== Aplicación Principal ==========

const App = (() => {
    const app = document.getElementById('app');

    // Verificar autenticación
    const checkAuth = () => {
        if (!AuthModule.isAuthenticated()) {
            showLoginPage();
        } else {
            showDashboard();
        }
    };

    // Página de login
    const showLoginPage = () => {
        app.innerHTML = `
            <div class="container-fluid" style="height: 100vh; display: flex; align-items: center; justify-content: center;">
                <div class="row w-100">
                    <div class="col-md-6 mx-auto">
                        <div class="card">
                            <div class="card-body p-5">
                                <h2 class="text-center mb-4">🏥 Plataforma Médica</h2>
                                
                                <ul class="nav nav-tabs" role="tablist" style="border-bottom: 2px solid #667eea;">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button">Iniciar Sesión</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register" type="button">Registrarse</button>
                                    </li>
                                </ul>

                                <div class="tab-content">
                                    <!-- Login Tab -->
                                    <div class="tab-pane fade show active" id="login" role="tabpanel">
                                        <form id="loginForm" class="mt-4">
                                            <div class="form-group mb-3">
                                                <label for="loginEmail" class="form-label">Email</label>
                                                <input type="email" class="form-control" id="loginEmail" required>
                                            </div>
                                            <div class="form-group mb-3">
                                                <label for="loginPassword" class="form-label">Contraseña</label>
                                                <input type="password" class="form-control" id="loginPassword" required>
                                            </div>
                                            <button type="submit" class="btn btn-primary w-100">Ingresar</button>
                                        </form>
                                    </div>

                                    <!-- Register Tab -->
                                    <div class="tab-pane fade" id="register" role="tabpanel">
                                        <form id="registerForm" class="mt-4">
                                            <div class="form-group mb-3">
                                                <label for="registerName" class="form-label">Nombre Completo</label>
                                                <input type="text" class="form-control" id="registerName" required>
                                            </div>
                                            <div class="form-group mb-3">
                                                <label for="registerEmail" class="form-label">Email</label>
                                                <input type="email" class="form-control" id="registerEmail" required>
                                            </div>
                                            <div class="form-group mb-3">
                                                <label for="registerPassword" class="form-label">Contraseña</label>
                                                <input type="password" class="form-control" id="registerPassword" required>
                                            </div>
                                            <div class="form-group mb-3">
                                                <label for="registerRole" class="form-label">Rol</label>
                                                <select class="form-select" id="registerRole" required>
                                                    <option value="">Seleccionar rol</option>
                                                    <option value="medico">Médico</option>
                                                    <option value="enfermero">Enfermero</option>
                                                </select>
                                            </div>
                                            <button type="submit" class="btn btn-primary w-100">Registrarse</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
        document.getElementById('registerForm').addEventListener('submit', handleRegister);
    };

    // Dashboard
    const showDashboard = () => {
        const user = AuthModule.getCurrentUser();
        
        app.innerHTML = `
            <div class="container-main">
                <!-- Header -->
                <div class="header d-flex justify-content-between align-items-center">
                    <h1><i class="bi bi-hospital"></i> Plataforma Médica</h1>
                    <div class="header-right">
                        <span>Bienvenido, <strong>${user.name}</strong></span>
                        <button class="btn btn-light btn-sm" id="logoutBtn">
                            <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>

                <!-- Navegación -->
                <ul class="nav nav-pills navbar-provider" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active" id="dashboard-tab" data-bs-toggle="pill" data-bs-target="#dashboard" type="button">
                            <i class="bi bi-speedometer2"></i> Dashboard
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="patients-tab" data-bs-toggle="pill" data-bs-target="#patients" type="button">
                            <i class="bi bi-people"></i> Pacientes
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="consultations-tab" data-bs-toggle="pill" data-bs-target="#consultations" type="button">
                            <i class="bi bi-chat-dots"></i> Consultas
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="prescriptions-tab" data-bs-toggle="pill" data-bs-target="#prescriptions" type="button">
                            <i class="bi bi-pill"></i> Prescripciones
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="reports-tab" data-bs-toggle="pill" data-bs-target="#reports" type="button">
                            <i class="bi bi-file-text"></i> Reportes
                        </button>
                    </li>
                </ul>

                <!-- Contenido -->
                <div class="tab-content">
                    <div class="tab-pane fade show active" id="dashboard" role="tabpanel">Contenido del Dashboard</div>
                    <div class="tab-pane fade" id="patients" role="tabpanel">Contenido de Pacientes</div>
                    <div class="tab-pane fade" id="consultations" role="tabpanel">Contenido de Consultas</div>
                    <div class="tab-pane fade" id="prescriptions" role="tabpanel">Contenido de Prescripciones</div>
                    <div class="tab-pane fade" id="reports" role="tabpanel">Contenido de Reportes</div>
                </div>
            </div>
        `;

        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    };

    // Manejadores de eventos
    const handleLogin = (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const result = AuthModule.login(email, password);
        if (result.success) {
            checkAuth();
        } else {
            alert(result.message);
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;
        
        const result = AuthModule.register(name, email, password, role);
        if (result.success) {
            alert(result.message);
            document.getElementById('registerForm').reset();
        } else {
            alert(result.message);
        }
    };

    const handleLogout = () => {
        AuthModule.logout();
        checkAuth();
    };

    // Inicializar
    const init = () => {
        PrescriptionsModule.getMedications(); // Inicializar medicamentos
        checkAuth();
    };

    return {
        init
    };
})();

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}
