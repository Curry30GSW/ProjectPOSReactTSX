import "font-awesome/css/font-awesome.min.css";

const ModulesGrid = () => {
  const modules = [
    { id: "btnClientes", name: "Clientes", shortcut: "(F1)", icon: "fa fa-users" },
    { id: "btnArticulos", name: "Artículos", shortcut: "(F2)", icon: "fa fa-archive" },
    { id: "btnProveedores", name: "Proveedores", shortcut: "(F3)", icon: "fa fa-truck" },
    { id: "btnReportes", name: "Reportes", shortcut: "(F4)", icon: "fa fa-bar-chart" },
    { id: "btnFacturas", name: "Facturas", shortcut: "(F5)", icon: "fa fa-file-text-o" },
    { id: "btnEmpleados", name: "Empleados", shortcut: "(F6)", icon: "fa fa-id-badge" },
    { id: "btnCaja", name: "Caja", shortcut: "(F7)", icon: "fa fa-credit-card" },
    { id: "btnConfiguracion", name: "Configuración", shortcut: "(F8)", icon: "fa fa-cog" },
  ];

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
                className="border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:border-blue-600 transition-all rounded-xl p-5 flex items-center justify-between w-full text-left"
              >
                <div>
                  <p className="text-xl font-semibold text-gray-700 dark:text-white/90">{mod.name}</p>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{mod.shortcut}</span>
                </div>
                <div className="flex items-center justify-center bg-blue-500 text-white rounded-full w-12 h-12 shadow-md">
                  <i className={`${mod.icon} text-lg`}></i>
                </div>
              </button>
            ))}
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
