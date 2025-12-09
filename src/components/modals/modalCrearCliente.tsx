import { useState, useEffect } from "react";
import Alert from "../ui/alert/Alert";
import { Modal } from "../ui/modal";

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
    clienteEditando?: Cliente | null; // Nueva prop para edición
    modo?: 'crear' | 'editar'; // Nueva prop para el modo
}

export default function ModalCrearCliente({
    isOpen,
    onClose,
    onClienteCreado,
    clienteEditando = null, // Valor por defecto
    modo = 'crear' // Valor por defecto
}: ModalCrearClienteProps) {
    const [cliente, setCliente] = useState<Cliente>({
        nombre: "",
        cedula: "",
        correo: "",
        telefono: "",
    });

    const [alertData, setAlertData] = useState<{
        show: boolean;
        variant: "success" | "error";
        title: string;
        message: string;
    }>({ show: false, variant: "success", title: "", message: "" });



    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (modo === 'editar' && clienteEditando) {
                // Modo editar: cargar datos del cliente
                setCliente(clienteEditando);
            } else {
                // Modo crear: limpiar formulario
                setCliente({
                    nombre: "",
                    cedula: "",
                    correo: "",
                    telefono: "",
                });
            }
        }
    }, [isOpen, modo, clienteEditando]);

    // Evitar scroll del body cuando el modal esté abierto y corregir salto de layout
    useEffect(() => {
        const restoreBody = (prevOverflow: string, prevPaddingRight: string) => {
            document.body.style.overflow = prevOverflow || "";
            document.body.style.paddingRight = prevPaddingRight || "";
        };

        if (typeof window === "undefined") return;

        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;

        if (isOpen) {
            // calcular ancho del scrollbar para evitar salto horizontal
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCliente({ ...cliente, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let url: string;
            let method: string;

            if (modo === 'crear') {
                // Crear nuevo cliente
                url = "http://localhost:3000/api/clientes";
                method = "POST";
            } else {
                // Editar cliente existente
                url = `http://localhost:3000/api/clientes/${clienteEditando?.id_cliente}`;
                method = "PUT";
            }

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cliente),
            });

            if (res.ok) {
                onClienteCreado(); // Actualizamos la tabla
                onClose(); // Cerramos el modal

                // Mostramos el alert después de un pequeño delay
                setTimeout(() => {
                    setAlertData({
                        show: true,
                        variant: "success",
                        title: modo === 'crear'
                            ? "¡Cliente creado exitosamente!"
                            : "¡Cliente actualizado exitosamente!",
                        message: modo === 'crear'
                            ? "El nuevo cliente se ha registrado en el sistema."
                            : "Los datos del cliente se han actualizado correctamente."
                    });
                }, 100);
            } else {
                const errorData = await res.json();
                setAlertData({
                    show: true,
                    variant: "error",
                    title: modo === 'crear'
                        ? "Error al crear cliente"
                        : "Error al actualizar cliente",
                    message: errorData.message || `Error al ${modo === 'crear' ? 'registrar' : 'actualizar'} el cliente.`
                });
            }
        } catch (err) {
            if (err instanceof Error) {
                setAlertData({
                    show: true,
                    variant: "error",
                    title: "Error de conexión",
                    message: err.message
                });
            } else {
                setAlertData({
                    show: true,
                    variant: "error",
                    title: "Error de conexión",
                    message: "No se pudo conectar con el servidor. Por favor, inténtelo de nuevo."
                });
            }
        }
    };

    if (!isOpen) {
        // Mantenemos el alert visible incluso cuando el modal está cerrado
        return alertData.show ? (
            <div className="fixed bottom-4 right-4 z-[100001] w-96 animate-fade-in-up">
                <Alert
                    variant={alertData.variant}
                    title={alertData.title}
                    message={alertData.message}
                    showLink={false}
                />
            </div>
        ) : null;
    }

    return (
        <>
            {/* 🔔 Alert flotante */}
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

            {/* 🪟 Modal con animación y fondo blur */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {modo === 'crear' ? 'Crear Cliente' : 'Editar Cliente'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 📋 Inputs 2x2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={cliente.nombre}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Cédula
                            </label>
                            <input
                                type="text"
                                name="cedula"
                                value={cliente.cedula}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Correo
                            </label>
                            <input
                                type="email"
                                name="correo"
                                value={cliente.correo}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                name="telefono"
                                value={cliente.telefono}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* ⚙️ Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            {modo === 'crear' ? 'Guardar' : 'Actualizar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}