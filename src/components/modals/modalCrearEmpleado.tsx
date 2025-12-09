import { useState, useEffect } from "react";
import Alert from "../ui/alert/Alert";
import { Modal } from "../ui/modal";

interface Empleado {
    id_empleado?: number;
    cedula: string;
    nombres: string;
    apellidos: string,
    correo: string;
    password: string;
    telefono: string;
    cargo: string;

}

interface ModalCrearEmpleadoProps {
    isOpen: boolean;
    onClose: () => void;
    onEmpleadoCreado: () => void;
    empleadoEditando?: Empleado | null; // Nueva prop para edición
    modo?: 'crear' | 'editar'; // Nueva prop para el modo
}

export default function ModalCrearCliente({
    isOpen,
    onClose,
    onEmpleadoCreado,
    empleadoEditando = null, // Valor por defecto
    modo = 'crear' // Valor por defecto
}: ModalCrearEmpleadoProps) {

    const isEdit = modo === 'editar';

    const [empleado, setEmpleado] = useState<Empleado>({
        cedula: "",
        nombres: "",
        apellidos: "",
        correo: "",
        password: "",
        telefono: "",
        cargo: "",

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
            if (isEdit && empleadoEditando) {
                // Modo editar: cargar datos del cliente
                setEmpleado({
                    ...empleadoEditando,
                    password: ""
                },
                );
            } else {
                // Modo crear: limpiar formulario
                setEmpleado({
                    cedula: "",
                    nombres: "",
                    apellidos: "",
                    correo: "",
                    password: "",
                    telefono: "",
                    cargo: ""

                });
            }
        }
    }, [isOpen, isEdit, empleadoEditando]);

    useEffect(() => {
        if (alertData.show) {
            const timer = setTimeout(() => {
                setAlertData({ ...alertData, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [alertData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmpleado({ ...empleado, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let url: string;
            let method: string;

            if (modo === 'crear') {
                // Crear nuevo cliente
                url = "http://localhost:3000/api/empleados";
                method = "POST";
            } else {
                // Editar cliente existente
                url = `http://localhost:3000/api/empleados/${empleadoEditando?.id_empleado}`;
                method = "PUT";
            }

            const payload: any = { ...empleado }
            if (isEdit && !empleado.password) {
                delete payload.password;
            }

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(empleado),
            });

            if (res.ok) {
                onEmpleadoCreado(); // Actualizamos la tabla
                onClose(); // Cerramos el modal

                // Mostramos el alert después de un pequeño delay
                setTimeout(() => {
                    setAlertData({
                        show: true,
                        variant: "success",
                        title: modo === 'crear'
                            ? "¡Empleado creado exitosamente!"
                            : "¡Empleado actualizado exitosamente!",
                        message: modo === 'crear'
                            ? "El nuevo empleado se ha registrado en el sistema."
                            : "Los datos del empleado se han actualizado correctamente."
                    });
                }, 100);
            } else {
                const errorData = await res.json();
                setAlertData({
                    show: true,
                    variant: "error",
                    title: modo === 'crear'
                        ? "Error al crear empleado"
                        : "Error al actualizar empleado",
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
                    {isEdit ? 'Editar Empleado' : 'Crear Empleado'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 📋 Inputs 2x2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Cédula
                            </label>
                            <input
                                type="text"
                                name="cedula"
                                value={empleado.cedula}
                                onChange={handleChange}
                                disabled={isEdit}
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>



                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="nombres"
                                value={empleado.nombres}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Apellido
                            </label>
                            <input
                                type="text"
                                name="apellidos"
                                value={empleado.apellidos}
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
                                value={empleado.correo}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300">Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                placeholder={isEdit ? "Dejar para no cambiar" : ""}
                                onChange={handleChange}

                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none    "
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                name="telefono"
                                value={empleado.telefono}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Cargo
                            </label>
                            <input
                                type="text"
                                name="cargo"
                                value={empleado.cargo}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Estado
                            </label>
                            <select
                                name="estado"
                                value={empleado.estado}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value={1}>Activo</option>
                                <option value={0}>Inactivo</option>
                            </select>
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
                            {isEdit ? 'Guardar' : 'Actualizar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}