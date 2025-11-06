import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import ModalCrearCliente from "../../components/modals/modalCrearCliente";

// Interfaz para el Cliente
interface Cliente {
    id_cliente?: number;
    nombre: string;
    cedula: string;
    correo: string;
    telefono: string;
}

export default function ClientesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reloadTable, setReloadTable] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [modo, setModo] = useState<'crear' | 'editar'>('crear');

  const handleClienteCreado = () => {
    setReloadTable(!reloadTable);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setModo('editar');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClienteEditando(null);
    setModo('crear');
  };

  return (
    <>
      <PageMeta title="Clientes | System POS" description="Gestión de clientes" />
      <PageBreadcrumb pageTitle="Clientes" />

      <div className="space-y-5 sm:space-y-6">
        {/* 🔘 Botón Crear Cliente */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            + Crear Cliente
          </button>
        </div>

        <ComponentCard title="Lista de Clientes" desc="Gestiona los clientes registrados.">
          <BasicTableOne 
            reload={reloadTable} 
            onEditCliente={handleEditCliente}
          />
        </ComponentCard>
      </div>

      {/* 🪟 Modal Crear/Editar Cliente */}
      <ModalCrearCliente
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onClienteCreado={handleClienteCreado}
        clienteEditando={clienteEditando}
        modo={modo}
      />
    </>
  );
}
