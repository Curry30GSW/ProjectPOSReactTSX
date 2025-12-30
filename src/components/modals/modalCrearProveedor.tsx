import { useState, useEffect } from "react";
import Alert from "../ui/alert/Alert";
import { Modal } from "../ui/modal";
import { fetchWithAuth } from "../api/fetchWithAuth";

interface Proveedor {
    id_proveedor?: number,
    nombre: string;
    cedula: string;
    correo: string;
    telefono: string;
    detalles: string;
}

interface ModalCrearProveedorProps {
    isOpen: boolean;
    onClose: () => void;
    onProveedorCreado: () => void;
    proveedorEditando?: Proveedor | null;
    modo?: 'crear' | 'editar'
}

export default function ModalCrearProveedor({
    isOpen,
    onClose,
    onProveedorCreado,
    proveedorEditando = null,
    modo = 'crear'
}: ModalCrearProveedorProps) {
    const [proveedor, setProveedor] = useState<Proveedor>({
        nombre: "",
        cedula: "",
        correo: "",
        telefono: "",
        detalles: ""
    });

    const [alertData, setAlertData] = useState<{
        show: boolean;
        variant: "success" | "error";
        title: string;
        message: string,
    }>({ show: false, variant: "success", title: "", message: "" });


    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (modo === 'editar' && proveedorEditando) {
                // Modo editar: cargar datos del cliente
                setProveedor(proveedorEditando);
            } else {
                // Modo crear: limpiar formulario
                setProveedor({
                    nombre: "",
                    cedula: "",
                    correo: "",
                    telefono: "",
                    detalles: "",
                });
            }
        }
    }, [isOpen, modo, proveedorEditando]);

    useEffect(() => {
        if (alertData.show) {
            const timer = setTimeout(() => {
                setAlertData({ ...alertData, show: false })
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [alertData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProveedor({ ...proveedor, [e.target.name]: e.target.value })
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let url: string;
            let method: string;

            if (modo === 'crear') {
                // Crear nuevo cliente
                url = "/api/proveedores";
                method = "POST";
            } else {
                // Editar cliente existente
                url = `/api/proveedores/${proveedorEditando?.id_proveedor}`;
                method = "PUT";
            }

            const res = await fetchWithAuth(url, {
                method: method,
                body: JSON.stringify(proveedor),
            });

            if (res.ok) {
                onProveedorCreado();
                onClose();
                setTimeout(() => {
                    setAlertData({
                        show: true,
                        variant: "success",
                        title: modo === 'crear'
                            ? "Proveedor creado exitosamente!"
                            : "Proveedor actualizado exitosamente!",
                        message: modo === 'crear'
                            ? "El nuevo proveedor se ha registrado en el sistema."
                            : "Los datos del proveedores se han actualizado correctamente."
                    });
                }, 100);
            } else {
                const errorData = await res.json();
                setAlertData({
                    show: true,
                    variant: "error",
                    title: modo === 'crear'
                        ? "Error al crear proveedor"
                        : "Error al actualizar proveedor",
                    message: errorData.message || `Error al ${modo === 'crear' ? 'registrar' : 'actualizar'} el cliente.`
                });
            }
        } catch (err) {
            if (err instanceof Error) {
                setAlertData({
                    show: true,
                    variant: "error",
                    title: "Error de conexion",
                    message: err.message
                });
            } else {
                setAlertData({
                    show: true,
                    variant: "error",
                    title: "Error de conexion",
                    message: "SE ha presentado un error ",
                })
            }
        }
    };


    if (!isOpen) {
        // Mantenemos el alert visible incluso cuando el modal está cerrado
        return alertData.show ? (
            <div className="fixed bottom-4 right-4 z-[100000] w-96 animate-fade-in-up">
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
                <div className="fixed bottom-4 right-4 z-[100000] w-96 animate-fade-in-up">
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
                    {modo === 'crear' ? 'Crear Proveedor' : 'Editar Proveedor'}
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
                                value={proveedor.nombre}
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
                                value={proveedor.cedula}
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
                                value={proveedor.correo}
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
                                value={proveedor.telefono}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Detalles
                            </label>
                            <input
                                type="text"
                                name="detalles"
                                value={proveedor.detalles}
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