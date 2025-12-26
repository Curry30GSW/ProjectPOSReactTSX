import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableArticulos";
import ModalCrearArticulo from "../../components/modals/modalCrearArticulo";

interface Articulo {
    id_articulo: number;
    descripcion: string;
    precio: string;
    stock: string;
    peso: string;
    codigo_barras: string;
}

export default function ArticuloPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reloadTable, setReloadTable] = useState(false);
    const [articuloEditando, setArticuloEditando] = useState<Articulo | null>(null);
    const [modo, setModo] = useState<"crear" | "editar">("crear");

    const handleArticuloCreado = () => {
        setReloadTable(!reloadTable);
    };

    const handleEditArticulo = (articulo: Articulo) => {
        setArticuloEditando(articulo);
        setModo("editar");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setArticuloEditando(null);
        setModo("crear");
    };

    return (
        <>
            <PageMeta
                title="Artículos | System POS"
                description="Gestión de artículos"
            />

            <div className="flex-1 overflow-hidden">
                <div className="max-w-8xl mx-auto h-full flex flex-col">

                    {/* HEADER */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                            Gestión de Artículos
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Visualiza y administra los artículos registrados
                        </p>

                        {/* ACCIÓN SUPERIOR */}
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                + Crear Artículo
                            </button>
                        </div>
                    </div>



                    {/* TABLA (CONTENEDOR PRINCIPAL) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden flex-1 min-h-0">
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto">
                                <BasicTableOne
                                    reload={reloadTable}
                                    onEditArticulo={handleEditArticulo}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* MODAL CREAR / EDITAR */}
            <ModalCrearArticulo
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onArticuloCreado={handleArticuloCreado}
                articuloEditando={articuloEditando}
                modo={modo}
            />
        </>
    );
}
