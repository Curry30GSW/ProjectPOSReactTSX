import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableProveedor";
import ModalCrearProveedor from "../../components/modals/modalCrearProveedor";

interface Proveedor {
    id_proveedor?: number;
    nombre: string;
    cedula: string;
    correo: string;
    telefono: string;
    detalles: string;
}

export default function ProveedorPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reloadTable, setReloadTable] = useState(false);
    const [proveedorEditando, setProveedorEditando] =
        useState<Proveedor | null>(null);
    const [modo, setModo] = useState<"crear" | "editar">("crear");

    const handleProveedorCreado = () => {
        setReloadTable(!reloadTable);
    };

    const handleEditProveedor = (proveedor: Proveedor) => {
        setProveedorEditando(proveedor);
        setModo("editar");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProveedorEditando(null);
        setModo("crear");
    };

    return (
        <>
            <PageMeta
                title="Proveedores | System POS"
                description="Gestión de proveedores"
            />

            <div className="flex-1 overflow-hidden">
                <div className="max-w-8xl mx-auto h-full flex flex-col">

                    {/* HEADER */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                            Gestión de Proveedores
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Visualiza y administra los proveedores registrados
                        </p>
                        {/* ACCIÓN SUPERIOR */}
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                + Crear Proveedor
                            </button>
                        </div>
                    </div>



                    {/* TABLA (CONTENEDOR PRINCIPAL) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden flex-1 min-h-0">
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto">
                                <BasicTableOne
                                    reload={reloadTable}
                                    onEditProveedor={handleEditProveedor}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* MODAL CREAR / EDITAR */}
            <ModalCrearProveedor
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onProveedorCreado={handleProveedorCreado}
                proveedorEditando={proveedorEditando}
                modo={modo}
            />
        </>
    );
}
