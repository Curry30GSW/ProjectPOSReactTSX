import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableCliente";
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
  const [modo, setModo] = useState<"crear" | "editar">("crear");

  const handleClienteCreado = () => {
    setReloadTable(!reloadTable);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setModo("editar");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClienteEditando(null);
    setModo("crear");
  };

  return (
    <>
      <PageMeta title="Clientes | System POS" description="Gestión de clientes" />

      <div className="flex-1 overflow-hidden">
        <div className="max-w-8xl mx-auto h-full flex flex-col">

          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Gestión de Clientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Visualiza y administra los clientes registrados en el sistema
            </p>

            {/* ACCIONES SUPERIORES */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                + Crear Cliente
              </button>
            </div>

          </div>


          {/* TABLA (CONTENEDOR PRINCIPAL) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden flex-1 min-h-0">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <BasicTableOne
                  reload={reloadTable}
                  onEditCliente={handleEditCliente}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL CREAR / EDITAR */}
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
