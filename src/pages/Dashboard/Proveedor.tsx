import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableProveedor";
import ModalCrearProveedor from "../../components/modals/modalCrearProveedor";


interface Proveedor {
    id_proveedor?: number,
    nombre: string;
    cedula: string;
    correo: string;
    telefono: string;
    detalles: string;

}

export default function ProveedorPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reloadTable, setReloadTable] = useState(false);
    const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null);
    const [modo, setModo] = useState<'crear' | 'editar'>('crear');

    const handleProvedorCreado = () => {
        setReloadTable(!reloadTable)
    }

    const handleEditProveedor = (proveedor: Proveedor) => {
        setProveedorEditando(proveedor);
        setModo('editar');
        setIsModalOpen(true)
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProveedorEditando(null);
        setModo('crear');
    }

    return (
        <>
            <PageMeta title="Proveedor | System POS" description="Gestion de Proveedor" />
            <PageBreadcrumb pageTitle="Proveedor" />

            <div className="space-y-5 sm:space-y-6">
                <div className="flex justify-end mb-4">
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">

                        + Crear Proveedor
                    </button>
                </div>

                <ComponentCard title="Lista de Proveedores" desc="Gestiona los proveedores registrados.">
                    <BasicTableOne
                        reload={reloadTable}
                        onEditProveedor={handleEditProveedor}
                    />
                </ComponentCard>
            </div>

            <ModalCrearProveedor
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onProveedorCreado={handleProvedorCreado}
                proveedorEditando={proveedorEditando}
                modo={modo}

            />
        </>
    )

}