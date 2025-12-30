import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../api/fetchWithAuth";

interface Cliente {
    id_cliente?: number;
    nombre: string;
    cedula: string;
    correo: string;
    telefono: string;
}

interface Props {
    modo?: "crear" | "editar";
    clienteEditando?: Cliente | null;
    onSuccess: (message?: string) => void;
    onError: (message: string) => void;
    onClose: () => void;
}

const inputBase =
    "w-full px-3 py-2 mt-1 text-sm rounded-lg border outline-none transition-colors " +
    "bg-white text-gray-900 border-gray-300 " +
    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:bg-gray-700 dark:text-white dark:border-gray-600 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400";

export default function CrearClienteForm({
    modo = "crear",
    clienteEditando = null,
    onSuccess,
    onError,
    onClose,
}: Props) {
    const [cliente, setCliente] = useState<Cliente>({
        cedula: "",
        nombre: "",
        correo: "",
        telefono: "",
    });

    useEffect(() => {
        if (modo === "editar" && clienteEditando) {
            setCliente(clienteEditando);
        } else {
            setCliente({
                cedula: "",
                nombre: "",
                correo: "",
                telefono: "",
            });
        }
    }, [modo, clienteEditando]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCliente({ ...cliente, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url =
                modo === "crear"
                    ? "/api/clientes"
                    : `/api/clientes/${clienteEditando?.id_cliente}`;

            const method = modo === "crear" ? "POST" : "PUT";

            const res = await fetchWithAuth(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(cliente),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                onSuccess(
                    modo === "crear"
                        ? "Cliente creado correctamente"
                        : "Cliente actualizado correctamente"
                );
                onClose();
            } else {
                onError(
                    data?.message ||
                    `Error al ${modo === "crear" ? "crear" : "actualizar"
                    } cliente`
                );
            }
        } catch (err) {
            onError("Error de conexión con el servidor");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
                        className={inputBase}
                    />
                </div>
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
                        className={inputBase}
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
                        className={inputBase}
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
                        className={inputBase}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="
                        px-4 py-2 text-sm font-medium rounded-lg transition-colors
                        bg-gray-200 text-gray-700 hover:bg-gray-300
                        dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500
                    "
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    className="
                        px-4 py-2 text-sm font-medium text-white rounded-lg
                        bg-blue-600 hover:bg-blue-700 transition-colors
                    "
                >
                    {modo === "crear" ? "Guardar" : "Actualizar"}
                </button>
            </div>
        </form>
    );
}
