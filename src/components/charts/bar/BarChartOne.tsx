// src/pages/Dashboard/estadisticas.tsx
import BarChartClientes from '../../../pages/Charts/BarChartClientes';
import BarChartProductos from '../../../pages/Charts/BarChartProductos';
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../../components/api/fetchWithAuth";
import PageMeta from '../../../components/common/PageMeta';

export default function estadisticas() {

  const [totalClientes, setTotalClientes] = useState<number | null>(null);

  useEffect(() => {
    fetchWithAuth("/api/total-clientes")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTotalClientes(data.total_clientes);
        }
      })
      .catch(err => {
        console.error("Error al obtener total de clientes", err);
      });
  }, []);


  return (
    <div className="space-y-6">
      <PageMeta
        title="Estadísticas de Ventas"
        description="Dashboard con estadísticas de clientes y productos"
      />
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Estadísticas de Ventas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Análisis de clientes y productos más relevantes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Clientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Productos</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Período Actual</p>
              <p className="text-lg font-bold">Diciembre 2025</p>
            </div>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Clientes</p>
              <p className="text-lg font-bold">
                {totalClientes !== null ? totalClientes : "--"}
              </p>
            </div>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Productos Analizados</p>
              <p className="text-lg font-bold">5</p>
            </div>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Clientes */}
        <div className="lg:col-span-1">
          <BarChartClientes />
        </div>

        {/* Gráfico de Productos */}
        <div className="lg:col-span-1">
          <BarChartProductos />
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-5">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Métricas de Clientes
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Los datos se actualizan automáticamente cada mes</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Se muestran los 5 clientes más compradores</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Los montos están en pesos colombianos ($)</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-5">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Métricas de Productos
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Se analizan las unidades vendidas por producto</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Se muestran los 5 productos más vendidos</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Los datos ayudan a identificar tendencias de venta</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Notas al pie */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/[0.05]">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <strong>Nota:</strong> Los datos mostrados corresponden al mes más reciente disponible.
          Los gráficos son interactivos - pasa el cursor sobre las barras para ver detalles.
        </p>
      </div>
    </div>
  );
}