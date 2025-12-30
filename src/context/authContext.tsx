import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string;
    cargo: string;
    foto_perfil?: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (cedula: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Función para decodificar JWT
    const decodeJWT = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error decodificando JWT:", error);
            return null;
        }
    };

    // Función para obtener datos del empleado
    const fetchEmpleadoData = async (token: string, cedula: string): Promise<AuthUser | null> => {
        try {
            const response = await fetch(`http://localhost:3000/api/empleados/${cedula}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token inválido o expirado
                    sessionStorage.removeItem("token");
                    return null;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                cedula: data.cedula,
                nombres: data.nombres,
                apellidos: data.apellidos,
                correo: data.correo,
                telefono: data.telefono,
                cargo: data.cargo,
                foto_perfil: data.foto_perfil
            };
        } catch (error) {
            console.error("Error obteniendo datos del empleado:", error);
            return null;
        }
    };

    // Cargar usuario desde el token
    const loadUserFromToken = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Decodificar token para obtener cédula
            const decoded = decodeJWT(token);
            if (!decoded || !decoded.cedula) {
                throw new Error("Token inválido");
            }

            // Obtener datos del empleado
            const empleadoData = await fetchEmpleadoData(token, decoded.cedula);

            if (empleadoData) {
                setUser(empleadoData);
            } else {
                // Si no se pueden obtener datos, limpiar token
                sessionStorage.removeItem("token");
                setUser(null);
            }
        } catch (error) {
            console.error("Error cargando usuario:", error);
            sessionStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Función de login
    const login = async (cedula: string, password: string) => {
        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cedula, password })
            });

            const data = await response.json();

            if (!response.ok || !data.token) {
                return {
                    success: false,
                    message: data.mensaje || data.message || "Error al iniciar sesión"
                };
            }

            // Guardar SOLO el token
            sessionStorage.setItem("token", data.token);

            // Cargar datos del usuario
            await loadUserFromToken();

            return {
                success: true,
                message: "Login exitoso"
            };

        } catch (error) {
            console.error("Error en login:", error);
            return {
                success: false,
                message: "Error de conexión con el servidor"
            };
        }
    };

    // Función de logout
    const logout = () => {
        sessionStorage.removeItem("token");
        setUser(null);
    };

    // Función para refrescar datos del usuario
    const refreshUser = async () => {
        await loadUserFromToken();
    };

    // Cargar usuario al montar el componente
    useEffect(() => {
        loadUserFromToken();
    }, []);

    // Configurar intervalo para refrescar datos periódicamente
    useEffect(() => {
        const interval = setInterval(() => {
            const token = sessionStorage.getItem("token");
            if (token) {
                loadUserFromToken();
            }
        }, 300000); // Refrescar cada 5 minutos

        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
}