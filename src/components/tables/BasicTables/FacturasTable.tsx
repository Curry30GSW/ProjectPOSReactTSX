import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";
import { formatFechaHora } from "../../utils/formatFechaHora";
import { getMetodoPagoStyles } from "../../utils/getMetodoPagoStyles";
import ModalDetallesFactura from '../../modals/ModalDetallesFactura';


interface Factura {
    id_factura: number;
    fecha_venta: string;
    total: string;
    cedula: string;
    nombre: string;
    metodo_pago: string;
}

interface FacturasTableProps {
    filtros: {
        tipo?: string;
        valor?: string;
        periodo?: string;
        fecha?: string;
        criterio?: "id" | "cedula";
    } | null;
}

export default function FacturasTable({ filtros }: FacturasTableProps) {
    const [facturas, setFacturas] = useState<Factura[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        monto_total: 0,
        promedio: 0
    });
    const [paginaActual, setPaginaActual] = useState(1);
    const filasPorPagina = 4;
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
    const [mostrarModalFactura, setMostrarModalFactura] = useState(false);


    const fetchFacturas = async () => {
        try {
            setLoading(true);
            setError(null);

            let url = "/api/facturas/search";

            // Construir URL según los filtros
            if (filtros) {
                switch (filtros.tipo) {
                    case "busqueda":
                        if (filtros.criterio === "id") {
                            url += `?id_factura=${encodeURIComponent(filtros.valor || '')}`;
                        } else {
                            url += `?cedula=${encodeURIComponent(filtros.valor || '')}`;
                        }
                        break;

                    case "periodo":
                        if (filtros.periodo === "dia") {
                            // Endpoint para facturas del día
                            url = `/api/facturas/hoy`;
                        } else if (filtros.periodo === "semana") {
                            // Endpoint para facturas de la semana
                            url = "/api/facturas/semana";
                        } else if (filtros.periodo === "mes") {
                            // Endpoint para facturas del mes
                            url = "/api/facturas/mes";
                        }
                        break;

                    case "estado":
                        // Endpoint para facturas por estado
                        url = `/api/facturas/estado?estado=${filtros.valor}`;
                        break;

                    default:
                        // Endpoint para todas las facturas (con paginación)
                        url = "/api/facturas";
                        break;
                }
            } else {
                // Sin filtros - traer todas
                url = "/api/facturas";
            }

            console.log("Fetching from URL:", url); // Para debug

            const response = await fetchWithAuth(url);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(data);


            // Validar que data sea un array
            if (!Array.isArray(data)) {
                throw new Error("Formato de respuesta inválido");
            }

            setFacturas(data);

            // Calcular estadísticas
            if (data.length > 0) {
                const montoTotal = data.reduce(
                    (sum: number, factura: Factura) => sum + Number(factura.total_iva),
                    0
                );
                const promedio = montoTotal / data.length;

                setStats({
                    total: data.length,
                    monto_total: montoTotal,
                    promedio: promedio
                });
            } else {
                setStats({ total: 0, monto_total: 0, promedio: 0 });
            }

        } catch (error: any) {
            console.error("Error fetching facturas:", error);
            setError(error.message || "Error al cargar las facturas");
            setFacturas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filtros?.tipo === "busqueda" && (!filtros.valor || filtros.valor.trim() === "")) {
            // No hacer fetch si es búsqueda vacía
            setFacturas([]);
            setStats({ total: 0, monto_total: 0, promedio: 0 });
            setLoading(false);
            return;
        }

        fetchFacturas();
    }, [filtros]);

    const handleVerDetalle = async (idFactura) => {
        try {
            const res = await fetchWithAuth(`/api/facturas/detalles/${idFactura}`);
            if (!res.ok) throw new Error("Error consultando la factura");

            const data = await res.json();
            setFacturaSeleccionada(data);
            setMostrarModalFactura(true);

        } catch (error) {
            console.error("Error al obtener factura:", error);
        }
    };

    const handleDescargarPDF = async (id: number, numero: string) => {
        try {
            // Asumiendo que tienes un endpoint para PDF
            const response = await fetchWithAuth(`/api/facturas/${id}/pdf`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error descargando PDF:", error);
            alert("Error al descargar el PDF");
        }
    };

    const handleReenviarEmail = async (id: number) => {
        try {
            const response = await fetchWithAuth(`/api/facturas/${id}/reenviar-email`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                alert("Factura reenviada exitosamente");
            } else {
                alert(data.message || "Error al reenviar la factura");
            }
        } catch (error) {
            console.error("Error reenviando email:", error);
            alert("Error al reenviar la factura");
        }
    };

    const handleExportarExcel = async () => {
        try {
            let params = new URLSearchParams();

            if (filtros?.tipo === "busqueda") {
                if (filtros.criterio === "id") {
                    params.append('id_factura', filtros.valor || '');
                } else {
                    params.append('cedula', filtros.valor || '');
                }
            }

            const response = await fetchWithAuth(`/api/facturas/exportar?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `facturas-${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exportando a Excel:", error);
            alert("Error al exportar a Excel");
        }
    };

    const handleImprimirListado = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Listado de Facturas</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { color: #333; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f4f4f4; }
                            .total { font-weight: bold; margin-top: 20px; }
                            .footer { margin-top: 30px; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <h1>${tituloVista}</h1>
                        <p>Fecha de impresión: ${new Date().toLocaleString()}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Factura</th>
                                    <th>Cliente</th>
                                    <th>Cédula</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Método Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${facturas.map(factura => `
                                    <tr>
                                        <td>${factura.id_factura}</td>
                                        <td>${factura.nombre}</td>
                                        <td>${factura.cedula}</td>
                                        <td>${new Date(factura.fecha_venta).toLocaleDateString()}</td>
                                        <td>$${parseFloat(factura.total).toFixed(2)}</td>
                                        <td>${factura.metodo_pago}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="total">
                            Total Facturas: ${stats.total}<br>
                            Monto Total: $${Number(stats.monto_total).toLocaleString("es-CO")}<br>
                            Promedio: $${Number(stats.promedio).toLocaleString("es-CO")}
                        </div>
                        <div class="footer">
                            Sistema POS - Impreso por: ${localStorage.getItem('usuario') || 'Usuario'}
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    const IconMetodoPago = ({ metodo }: Props) => {
        const metodoLower = metodo.toLowerCase();

        if (metodoLower.includes('efectivo')) {
            return (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        }

        if (metodoLower.includes('transferencia')) {
            return (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 11h16M4 15h10" />
                </svg>
            );
        }

        if (metodoLower.includes('tarjeta')) {
            return (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                </svg>
            );
        }

        if (metodoLower.includes('+') || metodoLower.includes('mixto')) {
            return (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M12 4v16" />
                </svg>
            );
        }

        return null;
    };

    const totalPaginas = Math.ceil(facturas.length / filasPorPagina);

    const indexInicio = (paginaActual - 1) * filasPorPagina;
    const indexFin = indexInicio + filasPorPagina;

    const facturasPaginadas = facturas.slice(indexInicio, indexFin);


    // Generar título basado en los filtros
    const tituloVista = filtros ?
        (filtros.tipo === "busqueda"
            ? `Facturas ${filtros.criterio === "id" ? "ID: " : "Cédula: "}${filtros.valor}`
            : filtros.tipo === "periodo"
                ? `Facturas del ${filtros.periodo === "dia" ? "Día" : filtros.periodo === "semana" ? "Última Semana" : "Mes"}`
                : filtros.tipo === "estado"
                    ? `Facturas ${filtros.valor === "pendiente" ? "Pendientes" : filtros.valor === "pagada" ? "Pagadas" : "Anuladas"}`
                    : "Todas las Facturas")
        : "Todas las Facturas";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Cargando facturas...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-600 dark:text-red-400 font-medium mb-2">{error}</p>
                    <button
                        onClick={fetchFacturas}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (facturas.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        No se encontraron facturas
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {filtros?.tipo === "busqueda"
                            ? `No hay facturas con ${filtros.criterio === "id" ? "ID" : "cédula"}: ${filtros.valor}`
                            : "No hay facturas que coincidan con los criterios de búsqueda"}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Volver al menú principal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="h-full flex flex-col">
                {/* ESTADÍSTICAS */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                        Total Facturas
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="text-blue-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                        Monto Total
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                                        ${Number(stats.monto_total).toLocaleString('es-ES')}
                                    </p>
                                </div>
                                <div className="text-green-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                                        Promedio por Factura
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                                        ${Number(stats.promedio).toLocaleString('es-ES')}
                                    </p>
                                </div>
                                <div className="text-purple-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    ID Factura
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Cédula
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Fecha y Hora
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Método Pago
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {facturasPaginadas.map((factura) => (
                                <tr
                                    key={factura.id_factura}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {factura.id_factura}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {factura.nombre}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {factura.cedula}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {formatFechaHora(factura.fecha_venta).fecha}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatFechaHora(factura.fecha_venta).hora}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            ${Number(factura.total_iva).toLocaleString("es-CO")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                                        ${getMetodoPagoStyles(factura.metodo_pago)}`}
                                        >
                                            <IconMetodoPago metodo={factura.metodo_pago} />
                                            <span>{factura.metodo_pago}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleVerDetalle(factura.id_factura)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                                                title="Ver detalles"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Ver
                                            </button>

                                            <button
                                                onClick={() => handleDescargarPDF(factura.id_factura, factura.id_factura.toString())}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1"
                                                title="Descargar PDF"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                PDF
                                            </button>

                                            <button
                                                onClick={() => handleReenviarEmail(factura.id_factura)}
                                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1"
                                                title="Reenviar por email"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Email
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Página {paginaActual} de {totalPaginas}
                    </span>

                    <div className="flex gap-2">
                        <button
                            disabled={paginaActual === 1}
                            onClick={() => setPaginaActual(paginaActual - 1)}
                            className="px-3 py-1 text-sm rounded-md border
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-white dark:bg-gray-700 dark:text-white"
                        >
                            Anterior
                        </button>

                        <button
                            disabled={paginaActual === totalPaginas}
                            onClick={() => setPaginaActual(paginaActual + 1)}
                            className="px-3 py-1 text-sm rounded-md border
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-white dark:bg-gray-700 dark:text-white"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>


                {/* PIE DE TABLA */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Mostrando {facturas.length} factura{facturas.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleImprimirListado}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir Listado
                            </button>
                            <button
                                onClick={handleExportarExcel}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exportar a Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ModalDetallesFactura
                isOpen={mostrarModalFactura}
                onClose={() => setMostrarModalFactura(false)}
                factura={facturaSeleccionada}
            />
        </>
    );
}