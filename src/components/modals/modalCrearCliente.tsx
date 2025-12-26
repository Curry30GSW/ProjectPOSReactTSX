import { useState, useEffect } from "react";
import Alert from "../ui/alert/Alert";
import { Modal } from "../ui/modal";
import CrearClienteForm from "./CrearClienteForm";

interface Cliente {
    id_cliente?: number;
    nombre: string;
    cedula: string;
    correo: string;
    telefono: string;
}

interface ModalCrearClienteProps {
    isOpen: boolean;
    onClose: () => void;
    onClienteCreado: () => void;
    clienteEditando?: Cliente | null;
    modo?: 'crear' | 'editar';
}

export default function ModalCrearCliente({
    isOpen,
    onClose,
    onClienteCreado,
    clienteEditando = null,
    modo = 'crear'
}: ModalCrearClienteProps) {
    const [alertData, setAlertData] = useState<{
        show: boolean;
        variant: "success" | "error";
        title: string;
        message: string;
    }>({ show: false, variant: "success", title: "", message: "" });

    // bloquear scroll y evitar salto de layout
    useEffect(() => {
        const restoreBody = (prevOverflow: string, prevPaddingRight: string) => {
            document.body.style.overflow = prevOverflow || "";
            document.body.style.paddingRight = prevPaddingRight || "";
        };

        if (typeof window === "undefined") return;

        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;

        if (isOpen) {
            const scrollBarComp = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = "hidden";
            if (scrollBarComp > 0) document.body.style.paddingRight = `${scrollBarComp}px`;
        } else {
            restoreBody(prevOverflow, prevPaddingRight);
        }

        return () => restoreBody(prevOverflow, prevPaddingRight);
    }, [isOpen]);

    useEffect(() => {
        if (alertData.show) {
            const timer = setTimeout(() => {
                setAlertData({ ...alertData, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [alertData]);

    const handleFormSuccess = (message?: string) => {
        setAlertData({ show: true, variant: "success", title: message || "Éxito", message: message || "Operación exitosa" });
        onClienteCreado();
    };

    const handleFormError = (message: string) => {
        setAlertData({ show: true, variant: "error", title: "Error", message });
    };

    return (
        <>
            {/* Alert flotante */}
            {alertData.show && (
                <div className="fixed bottom-4 right-4 z-[100001] w-96 animate-fade-in-up">
                    <Alert
                        variant={alertData.variant}
                        title={alertData.title}
                        message={alertData.message}
                        showLink={false}
                    />
                </div>
            )}

            {/* Modal */}
            {isOpen && (
                <Modal isOpen={isOpen} onClose={onClose}>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {modo === 'crear' ? 'Crear Cliente' : 'Editar Cliente'}
                    </h2>

                    <CrearClienteForm
                        modo={modo}
                        clienteEditando={clienteEditando}
                        onSuccess={(msg) => handleFormSuccess(msg)}
                        onError={(msg) => handleFormError(msg)}
                        onClose={onClose}
                    />
                </Modal>
            )}
        </>
    );
}