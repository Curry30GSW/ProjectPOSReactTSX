import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import { useEffect, useState, useMemo } from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";

interface Empleado {
  id_empleado: number;
  cedula: string;
  nombres: string;
  apellidos: string,
  correo: string;
  password: string;
  telefono: string;
  cargo: string;
  estado: number;
}

interface EmpleadoTableProps {
  reload?: boolean;
  onEditEmpleado?: (empleado: Empleado) => void; // Nueva prop
}

export default function EmpleadoTable({ reload, onEditEmpleado }: EmpleadoTableProps) {
  const [empleados, setEmpleado] = useState<Empleado[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  //  Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth("/api/empleados");
        const data = await res.json();
        setEmpleado(data);
      } catch (error) {
        console.error("Error al obtener empleados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmpleados();
  }, [reload]); // Agregamos reload como dependencia

  //  Filtro por nombre o cédula
  const filteredEmpleados = useMemo(() => {
    return empleados.filter(
      (c) =>
        c.nombres.toLowerCase().includes(search.toLowerCase()) ||
        c.cedula.includes(search)
    );
  }, [empleados, search]);

  // Paginación calculada
  const totalPages = Math.ceil(filteredEmpleados.length / itemsPerPage);
  const paginatedEmpleados = filteredEmpleados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //  Función para manejar edición
  const handleEditProveedor = (empleado: Empleado) => {
    if (onEditEmpleado) {
      onEditEmpleado(empleado);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Cargando clientes...</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4">
      {/*  Buscador */}
      <div className="mb-4 flex justify-between items-center">
        <div className="relative w-80">
          {/* Icono de búsqueda */}
          <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
            <svg
              className="fill-gray-500 dark:fill-gray-400"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
              />
            </svg>
          </span>

          {/* Campo de búsqueda */}
          <input
            type="text"
            placeholder="Buscar por Nombre o Cédula"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs
                 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10
                 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-blue-800"
          />
        </div>

        {/* Contador de resultados */}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredEmpleados.length} resultado(s)
        </span>
      </div>


      {/* 📋 Tabla */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-4 text-lg font-medium text-start text-theme-md dark:text-white/90">
                  Cedula
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-lg font-medium text-start text-theme-md dark:text-white/90">
                  Nombre
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-lg font-medium text-start text-theme-md dark:text-white/90">
                  Apellido
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-lg font-medium text-start text-theme-md dark:text-white/90">
                  Correo
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-lg font-medium text-start text-theme-md dark:text-white/90">
                  Teléfono
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-lg font-medium text-start text-theme-md dark:text-white/90">
                  Cargo
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-lg font-medium text-start text-theme-md dark:text-white/90">
                  Estado
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedEmpleados.map((empleado) => (
                <TableRow key={empleado.id_empleado}>
                  <TableCell className="px-5 py-4 font-medium text-gray-600 dark:text-white/90 align-middle">
                    {empleado.cedula}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400 align-middle">
                    {empleado.nombres}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400 align-middle">
                    {empleado.apellidos}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400 align-middle">
                    {empleado.correo}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400 align-middle">
                    {empleado.telefono}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400 align-middle">
                    {empleado.cargo}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400 align-middle">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${empleado.estado === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {empleado.estado === 1 ? "Activo" : "Inactivo"}
                    </span>

                  </TableCell>
                  <TableCell className="px-5 py-4 align-middle">
                    <div className="flex items-center justify-start h-full">
                      {/* Botón Editar */}
                      <button
                        onClick={() => handleEditProveedor(empleado)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 transition-colors whitespace-nowrap"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Editar
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 🔸 Paginación */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
               hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
               dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
        >
          ← Anterior
        </button>

        <span className="text-sm text-gray-700 dark:text-gray-400">
          Página {currentPage} de {totalPages || 1}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
               hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
               dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}