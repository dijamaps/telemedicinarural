// ========== Módulo de Autenticación ==========

const AuthModule = (() => {
    const STORAGE_KEY = 'provider_auth';
    const USERS_KEY = 'provider_users';

    // Verificar si el usuario está autenticado
    const isAuthenticated = () => {
        return localStorage.getItem(STORAGE_KEY) !== null;
    };

    // Obtener usuario actual
    const getCurrentUser = () => {
        const auth = localStorage.getItem(STORAGE_KEY);
        return auth ? JSON.parse(auth) : null;
    };

    // Registrar nuevo usuario
    const register = (name, email, password, role) => {
        let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'El usuario ya existe' };
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password, // En producción, usar hashing
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return { success: true, message: 'Usuario registrado exitosamente' };
    };

    // Login
    const login = (email, password) => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Credenciales inválidas' };
        }

        const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        return { success: true, user: session };
    };

    // Logout
    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    // Verificar permisos
    const hasRole = (role) => {
        const user = getCurrentUser();
        return user && user.role === role;
    };

    return {
        isAuthenticated,
        getCurrentUser,
        register,
        login,
        logout,
        hasRole
    };
})();
