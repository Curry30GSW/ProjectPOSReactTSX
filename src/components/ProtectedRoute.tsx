import { useNavigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode"
import Swal from 'sweetalert2';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = sessionStorage.getItem("token")
    const navigate = useNavigate()

    useEffect(() => {

        if (!token) {
            navigate("/signin", { replace: true });
            return;
        }

        try {
            const decoded: any = jwtDecode(token)
            const now = Date.now() / 1000;

            if (decoded.exp < now) {
                sessionStorage.clear();

                Swal.fire({
                    icon: "warning",
                    title: "Sesión expirada",
                    text: "Tu sesión ha expirado, por favor inicia sesión nuevamente.",
                    confirmButtonText: "OK",
                }).then(() => {
                    navigate("/signin", { replace: true });
                });

            }

        } catch (error) {
            sessionStorage.clear()
            navigate("/signin", { replace: true });
        }

    }, [token, navigate])



    if (!token) return null;
    return <> {children} </>
}