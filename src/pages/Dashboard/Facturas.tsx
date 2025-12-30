import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ModalBuscarFactura from "../../components/modals/ModalBuscarFactura.tsx";
import FacturasTable from "../../components/tables/BasicTables/FacturasTable.tsx";
import * as XLSX from 'xlsx';
import { fetchWithAuth } from "../../components/api/fetchWithAuth.ts";
import { showLoading, showSuccess, showError, showConfirm, getSwalConfig } from "../../components/utils/swalConfig.ts";
import Swal from 'sweetalert2';

interface FiltrosFactura {
    tipo?: string;
    valor?: string;
    periodo?: string;
    fecha?: string;
}

export default function FacturasPage() {
    const [vistaActual, setVistaActual] = useState<"menu" | "tabla">("menu");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filtrosActivos, setFiltrosActivos] = useState<FiltrosFactura | null>(null);
    const [tituloVista, setTituloVista] = useState("Gestión de Facturas");

    const handleExportarExcelHoy = async () => {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            const config = getSwalConfig();

            showLoading('Exportando facturas', 'Obteniendo las facturas del día de hoy...');

            const response = await fetchWithAuth(`/api/facturas/hoy`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const facturas = await response.json();

            if (!Array.isArray(facturas) || facturas.length === 0) {
                showError('Sin datos', 'No hay facturas para exportar hoy');
                return;
            }

            Swal.close();

            // Calcular estadísticas
            const totalVendido = facturas.reduce((sum: number, f: any) => sum + parseFloat(f.total), 0);
            const promedio = totalVendido / facturas.length;

            // Pedir confirmación
            const confirmResult = await showConfirm(
                'Confirmar exportación',
                `
                <div style="text-align: left; margin: 1rem 0;">
                    <p><strong>Resumen de facturas de hoy:</strong></p>
                    <p>• Total de facturas: <strong>${facturas.length}</strong></p>
                    <p>• Total vendido: <strong>$${Number(totalVendido).toLocaleString('es-ES')}</strong></p>
                    <p>• Promedio por factura: <strong>$${Number(promedio).toLocaleString('es-ES')}</strong></p>
                </div>
            `,
                'Exportar a Excel'
            );

            if (!confirmResult.isConfirmed) {
                return;
            }


            // Preparar datos para Excel
            const datosExcel = facturas.map(factura => ({
                'No. Factura': factura.id_factura,
                'Fecha - Hora': new Date(factura.fecha_venta).toLocaleString('es-ES'),
                'Cliente': factura.nombre,
                'Cédula': factura.cedula,
                'Subtotal': `$${(Number(factura.total)).toLocaleString('es-ES')}`,
                'IVA (19%)': `$${(Number(factura.total) * 0.19).toLocaleString('es-ES')}`,
                'Método Pago': factura.metodo_pago,
                'Total Venta': `$${Number(factura.total_iva).toLocaleString('es-ES')}`
            }));

            // Crear hoja de cálculo
            const worksheet = XLSX.utils.json_to_sheet(datosExcel);

            // Agregar totales al final
            const totalFacturas = facturas.length;


            const datosTotales = [
                {}, // fila vacía
                {
                    'No. Factura': 'ESTADÍSTICAS',
                    'Fecha': '',
                    'Cliente': '',
                    'Cédula': '',
                    'Subtotal': '',
                    'IVA (19%)': '',
                    'Método Pago': '',
                    'Total Venta': ''
                },
                {
                    'No. Factura': 'Total Facturas:',
                    'Total Venta': totalFacturas
                },
                {
                    'No. Factura': 'Total Vendido:',
                    'Total Venta': `$${Number(totalVendido).toLocaleString('es-ES')}`

                },
                {
                    'No. Factura': 'Promedio por Factura:',
                    'Total Venta': `$${Number(promedio).toLocaleString('es-ES')}`
                }
            ];

            const worksheetTotales = XLSX.utils.json_to_sheet(datosTotales, { skipHeader: true });
            XLSX.utils.sheet_add_json(worksheet, datosTotales, { skipHeader: true, origin: -1 });

            // Crear libro de trabajo
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturas de Hoy');

            // Generar archivo Excel
            const fechaActual = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `facturas-hoy-${fechaActual}.xlsx`);

            showSuccess(
                '✅ Exportación exitosa',
                `
                <div style="text-align: center;">
                    <p><strong>Facturas exportadas exitosamente</strong></p>
                    <div style="text-align: left; background: ${config.background === '#1f2937' ? '#374151' : '#f3f4f6'}; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
                        <p style="margin: 0.5rem 0;">📋 <strong>Archivo:</strong> facturas-hoy-${hoy}.xls</p>
                        <p style="margin: 0.5rem 0;">📄 <strong>Facturas exportadas:</strong> ${facturas.length}</p>
                        <p style="margin: 0.5rem 0;">💰 <strong>Total vendido:</strong> $${Number(totalVendido).toLocaleString('es-ES')}</p>
                    </div>
                </div>
            `,
                4000
            );


        } catch (error: any) {
            console.error("Error exportando a Excel:", error);
            alert(`❌ Error al exportar: ${error.message}`);
        }
    };

    const acciones = [
        {
            id: "buscar",
            titulo: "Buscar Factura",
            descripcion: "Busca una factura específica por ID o cédula del cliente",
            icono: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            color: "bg-blue-500 hover:bg-blue-600",
            accion: () => setIsModalOpen(true)
        },
        {
            id: "hoy",
            titulo: "Facturas de Hoy",
            descripcion: "Muestra todas las facturas emitidas hoy",
            icono: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "bg-red-500 hover:bg-red-600",
            accion: () => {
                const hoy = new Date().toISOString().split('T')[0];
                setFiltrosActivos({ tipo: "periodo", periodo: "dia", fecha: hoy });
                setTituloVista("Facturas de Hoy");
                setVistaActual("tabla");
            }
        },
        {
            id: "semana",
            titulo: "Facturas de la Semana",
            descripcion: "Muestra las facturas de los últimos 7 días",
            icono: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            color: "bg-purple-500 hover:bg-purple-600",
            accion: () => {
                setFiltrosActivos({ tipo: "periodo", periodo: "semana" });
                setTituloVista("Facturas de la Semana");
                setVistaActual("tabla");
            }
        },
        {
            id: "mes",
            titulo: "Facturas del Mes",
            descripcion: "Muestra todas las facturas del mes actual",
            icono: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            color: "bg-yellow-500 hover:bg-yellow-600",
            accion: () => {
                setFiltrosActivos({ tipo: "periodo", periodo: "mes" });
                setTituloVista("Facturas del Mes");
                setVistaActual("tabla");
            }
        },
        {
            id: "exportar-hoy",
            titulo: "Exportar a Excel",
            descripcion: "Exporta a Excel todas las facturas realizadas el día de hoy",
            icono: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: "bg-green-500 hover:bg-green-600",
            accion: () => handleExportarExcelHoy()
        },
        {
            id: "buscar-fecha",
            titulo: "Buscar Factura por Fecha",
            descripcion: "Permite ver facturas emitidas en un rango de fecha específico",
            icono: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            color: "bg-indigo-500 hover:bg-indigo-600",
            accion: () => {
                setIsFechaModalOpen(true);
            }
        }
    ];

    const handleBuscarFactura = (tipo: "id" | "cedula", valor: string) => {
        setFiltrosActivos({ tipo: "busqueda", valor, criterio: tipo });
        setTituloVista(`Factura ${tipo === "id" ? "ID: " : "Cédula: "}${valor}`);
        setVistaActual("tabla");
        setIsModalOpen(false);
    };

    const handleVolverMenu = () => {
        setVistaActual("menu");
        setTituloVista("Gestión de Facturas");
        setFiltrosActivos(null);
    };

    return (
        <>
            <PageMeta
                title="Facturas | System POS"
                description="Gestión y consulta de facturas"
            />

            <div className="flex-1 overflow-hidden">
                <div className="max-w-8xl mx-auto h-full flex flex-col">
                    {/* HEADER */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                                    {tituloVista}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {vistaActual === "menu"
                                        ? "Selecciona una opción para ver las facturas"
                                        : "Visualizando facturas según tu selección"}
                                </p>
                            </div>

                            {vistaActual === "tabla" && (
                                <button
                                    onClick={handleVolverMenu}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Volver al Menú
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CONTENIDO PRINCIPAL */}
                    <div className="flex-1 overflow-hidden">
                        {vistaActual === "menu" ? (
                            // VISTA DE MENÚ CON BOTONES
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {acciones.map((accion) => (
                                        <button
                                            key={accion.id}
                                            onClick={accion.accion}
                                            className={`${accion.color} rounded-xl p-6 text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center`}
                                        >
                                            <div className="mb-4">
                                                {accion.icono}
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">{accion.titulo}</h3>
                                            <p className="text-white/80 text-sm">{accion.descripcion}</p>
                                        </button>
                                    ))}
                                </div>

                                {/* ACCIONES ADICIONALES */}
                                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                        Acciones Rápidas
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                                            Generar Reporte
                                        </button>
                                        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                                            Exportar a Excel
                                        </button>
                                        <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                                            Ver Estadísticas
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // VISTA DE TABLA CON RESULTADOS
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden flex-1 min-h-0">
                                <div className="h-full flex flex-col">
                                    {/* CABECERA DE LA TABLA */}
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                                    {tituloVista}
                                                </h2>
                                                {filtrosActivos && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            Filtro aplicado:
                                                        </span>
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {filtrosActivos.tipo === "busqueda"
                                                                ? `Búsqueda por ${filtrosActivos.criterio}: ${filtrosActivos.valor}`
                                                                : filtrosActivos.tipo === "periodo"
                                                                    ? `Período: ${filtrosActivos.periodo}`
                                                                    : `Estado: ${filtrosActivos.valor}`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                Nueva Búsqueda
                                            </button>
                                        </div>
                                    </div>

                                    {/* TABLA */}
                                    <div className="flex-1 overflow-y-auto">
                                        <FacturasTable
                                            filtros={filtrosActivos}
                                            key={JSON.stringify(filtrosActivos)} // Forzar re-render con nuevos filtros
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL BUSCAR FACTURA */}
            <ModalBuscarFactura
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onBuscar={handleBuscarFactura}
            />
        </>
    );
}