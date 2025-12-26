import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css";

const ModulesGrid = () => {
  const navigate = useNavigate();

  const modules = [
    { id: "btnClientes", name: "Clientes", shortcut: "(F1)", icon: "fa fa-users", path: "/clientes" },
    { id: "btnArticulos", name: "Artículos", shortcut: "(F2)", icon: "fa fa-archive", path: "/articulos" },
    { id: "btnProveedores", name: "Proveedores", shortcut: "(F3)", icon: "fa fa-truck", path: "/proveedores" },
    { id: "btnReportes", name: "Estadísticas", shortcut: "(F4)", icon: "fa fa-bar-chart", path: "/estadisticas" },
    { id: "btnFacturas", name: "Facturas", shortcut: "(F5)", icon: "fa fa-file-text-o", path: "/facturas" },
    { id: "btnEmpleados", name: "Empleados", shortcut: "(F6)", icon: "fa fa-id-badge", path: "/empleados" },
    { id: "btnCaja", name: "Caja", shortcut: "(F7)", icon: "fa fa-credit-card", path: "/caja" },
    { id: "btnConfiguracion", name: "Configuración", shortcut: "(F8)", icon: "fa fa-cog", path: "/configuracion" },
  ];

  // Función para navegar a un módulo
  const navigateToModule = (path: string) => {
    navigate(path);
  };

  // Manejador de eventos del teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevenir el comportamiento por defecto de F1 (help)
      if (event.key === "F1") {
        event.preventDefault();
        navigateToModule("/clientes");
      } else if (event.key === "F2") {
        event.preventDefault();
        navigateToModule("/articulos");
      } else if (event.key === "F3") {
        event.preventDefault();
        navigateToModule("/proveedores");
      } else if (event.key === "F4") {
        event.preventDefault();
        navigateToModule("/reportes");
      } else if (event.key === "F5") {
        event.preventDefault();
        navigateToModule("/facturas");
      } else if (event.key === "F6") {
        event.preventDefault();
        navigateToModule("/empleados");
      } else if (event.key === "F7") {
        event.preventDefault();
        navigateToModule("/caja");
      } else if (event.key === "F8") {
        event.preventDefault();
        navigateToModule("/configuracion");
      }
    };

    // Agregar event listener
    document.addEventListener("keydown", handleKeyDown);

    // Limpiar event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      <main className="flex-grow p-6 overflow-hidden">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-800 dark:bg-white/[0.03] transition-colors duration-300 p-6">
          <h1 className="text-center text-3xl font-bold text-black dark:text-white/90">
            ¡Haz click en algún módulo debajo para empezar!
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {modules.map((mod) => (
              <button
                key={mod.id}
                id={mod.id}
                onClick={() => navigateToModule(mod.path)}
                className="border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:border-blue-600 transition-all rounded-xl p-5 flex items-center justify-between w-full text-left group cursor-pointer"
              >
                <div>
                  <p className="text-xl font-semibold text-gray-700 dark:text-white/90 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {mod.name}
                  </p>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {mod.shortcut}
                  </span>
                </div>
                <div className="flex items-center justify-center bg-blue-500 text-white rounded-full w-12 h-12 shadow-md group-hover:bg-blue-600 transition-colors">
                  <i className={`${mod.icon} text-lg`}></i>
                </div>
              </button>
            ))}
          </div>

          {/* Mensaje de ayuda para el usuario */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 <strong>Tip:</strong> También puedes usar las teclas F1 - F8 para acceder rápidamente a los módulos
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-md border-t border-gray-200 dark:border-gray-800">
        © {new Date().getFullYear()} Diseñado por{" "}
        <a
          href="https://www.instagram.com/andres_753_/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          Andrés Guapacha
        </a>
      </footer>
    </div>
  );
};

export default ModulesGrid;