import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard"
import BasicTableOne from "../../components/tables/BasicTables/BasicTableArticulos";
import ModalCrearArticulo from "../../components/modals/modalCrearArticulo"


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
    const [reloadTable, setReloadTable] = useState(false)
    const [articuloEditando, setArticuloEditando] = useState<Articulo | null>(null);
    const [modo, setModo] = useState<'crear' | 'editar'>('crear')


    const handleArticuloCreado = () => {
        setReloadTable(!reloadTable);
    };

    const handleEditArticulo = (articulo: Articulo) => {
        setArticuloEditando(articulo);
        setModo('editar');
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setArticuloEditando(null);
        setModo('crear')
    }

    return (
        <>
            <PageMeta title="Articulos | Systemn POS" description="Gestion de Articulos" />
            <PageBreadcrumb pageTitle="Articulos" />
            <div className="space-y-5 sm:space-y-6">
                <div className="flex justify-end mb-4">
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                        + Crear Articulo
                    </button>
                </div>

                <ComponentCard title="" desc="">
                    <BasicTableOne
                        reload={reloadTable}
                        onEditArticulo={handleEditArticulo}
                    />
                </ComponentCard>
            </div>

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