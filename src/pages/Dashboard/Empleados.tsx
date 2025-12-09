import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableEmpleado";
import ModalCrearEmpleado from "../../components/modals/modalCrearEmpleado";


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

export default function EmpleadosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reloadTable, setReloadTable] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState<Empleado | null>(null);
  const [modo, setModo] = useState<'crear' | 'editar'>('crear');

  const handleEmpleadoCreado = () => {
    setReloadTable(!reloadTable);
  };

  const handleEditEmpleado = (empleado: Empleado) => {
    setEmpleadoEditando(empleado);
    setModo('editar');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmpleadoEditando(null);
    setModo('crear');
  };

  return (
    <>
      <PageMeta title="Clientes | System POS" description="Gestión de empleados" />
      <PageBreadcrumb pageTitle="Empleados" />

      <div className="space-y-5 sm:space-y-6">
        {/* 🔘 Botón Crear Cliente */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            + Crear Empleado
          </button>
        </div>

        <ComponentCard title="Lista de Empleados" desc="Gestiona los empleados registrados.">
          <BasicTableOne
            reload={reloadTable}
            onEditEmpleado={handleEditEmpleado}
          />
        </ComponentCard>
      </div>

      {/* 🪟 Modal Crear/Editar Cliente */}
      <ModalCrearEmpleado
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEmpleadoCreado={handleEmpleadoCreado}
        empleadoEditando={empleadoEditando}
        modo={modo}
      />
    </>
  );

}