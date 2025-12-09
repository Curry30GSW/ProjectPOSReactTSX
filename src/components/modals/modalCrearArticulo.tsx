import { useState, useEffect } from "react";
import Alert from "../ui/alert/Alert";
import { Modal } from "../ui/modal";

interface Articulo {
    id_articulo?: number;
  descripcion: string;
  precio: string;
  stock: string;
  peso: string;
  codigo_barras: string; 

}

interface ModalCrearArticuloProps {
    isOpen : boolean;
    onClose: () => void;
    onArticuloCreado: () => void;
    articuloEditando ? : Articulo | null; 
    modo?: 'crear'| 'editar'
}   

export default function ModalCrearArticulo({
           isOpen,
            onClose,
            onArticuloCreado,
            articuloEditando = null,
            modo = 'crear'
}: ModalCrearArticuloProps) {
    const [articulo, setArticulo] = useState<Articulo>({
       
        descripcion: "",
        precio: "",
        stock: "",
        peso: "",
        codigo_barras: "",

    });

    const [alertData, setAlertData] = useState<{
        show: boolean;
        variant: "success" | "error";
        title: string;
        message: string,
    }> ({show: false, variant: "success", title: "", message: ""});


    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (modo === 'editar' && articuloEditando) {
                // Modo editar: cargar datos del cliente
                setArticulo(articuloEditando);
            } else {
                // Modo crear: limpiar formulario
                setArticulo({
                    descripcion: "",
                    precio: "",
                    stock: "",
                    peso: "",
                    codigo_barras: "",
                });
            }
        }
    }, [isOpen, modo, articuloEditando]);

    useEffect(()  => {
        if (alertData.show) {
            const timer = setTimeout(() => {
                setAlertData({ ...alertData, show: false})
            }, 3000)
             return () => clearTimeout(timer)
        }
    }, [alertData])

    const handleChange = (e :  React.ChangeEvent<HTMLInputElement>) => {
        setArticulo({...articulo, [e.target.name]: e.target.value })
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
              let url: string;
            let method: string;

            if (modo === 'crear') {
                // Crear nuevo cliente
                url = "http://localhost:3000/api/insertar-articulos";   
                method = "POST";
            } else {
                // Editar cliente existente
                url = `http://localhost:3000/api/actualizar-articulos/${articuloEditando?.id_articulo}`;
                method = "PUT";
            }

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(articulo),
            });

            if (res.ok) {
                onArticuloCreado(); // Actualizamos la tabla
                onClose(); // Cerramos el modal

                // Mostramos el alert después de un pequeño delay
                setTimeout(() => {
                    setAlertData({
                        show: true,
                        variant: "success",
                        title: modo === 'crear'
                            ? "Articulo creado exitosamente!"
                            : "Articulo actualizado exitosamente!",
                        message: modo === 'crear'
                            ? "El nuevo articulo se ha registrado en el sistema."
                            : "Los datos del articulos se han actualizado correctamente."
                    });
                }, 100);
            } else {
                const errorData = await res.json();
                setAlertData({
                    show: true,
                    variant: "error",
                    title: modo === 'crear'
                        ? "Error al crear articulo"
                        : "Error al actualizar articulo",
                    message: errorData.message || `Error al ${modo === 'crear' ? 'registrar' : 'actualizar'} el cliente.`
                });
            }
        } catch (err) {
            if (err instanceof Error){
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
                    {modo === 'crear' ? 'Crear Articulo' : 'Editar Articulo'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 📋 Inputs 2x2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Descripcion
                            </label>
                            <input
                                type="text"
                                name="descripcion"
                                value={articulo.descripcion}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Precio
                            </label>
                            <input
                                type="text"
                                name="precio"
                                value={articulo.precio}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Stock
                            </label>
                            <input
                                type="text"
                                name="stock"
                                value={articulo.stock}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Peso
                            </label>
                            <input
                                type="text" 
                                name="peso"
                                value={articulo.peso}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 text-sm border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-300">
                                Codigo Barras
                            </label>

                            <input
                                type="text" 
                                name="codigo_barras"
                                value={articulo.codigo_barras}
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