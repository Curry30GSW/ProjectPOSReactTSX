import { useState, useEffect } from "react";
import { Modal } from '../ui/modal';
import Swal from 'sweetalert2';
import ModalDetallesFactura from '../../components/modals/modalDetallesFactura';
import { fetchWithAuth } from "../../components/api/fetchWithAuth";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "../ui/table/index";
import { getMetodoPagoStyles } from "../utils/getMetodoPagoStyles";


const ModalDetallesCierre = ({
    isOpen,
    onClose,
    detallesCierre,
    loading,
    onActualizarObservaciones
}) => {

    // Estados para el modal de factura
    const [mostrarModalFactura, setMostrarModalFactura] = useState(false);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
    const [loadingFactura, setLoadingFactura] = useState(false);

    // Formatear fecha
    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString);
        return fecha.toLocaleString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Formatear número
    const formatearNumero = (numero) => {
        const valor = Number(numero);

        if (isNaN(valor)) return '$ 0';

        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };


    // Formatear hora
    const formatearHora = (fechaString) => {
        return new Date(fechaString).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Función para ver factura
    const verFactura = async (idFactura) => {
        try {
            setLoadingFactura(true);
            const res = await fetchWithAuth(`/api/facturas/detalles/${idFactura}`);

            if (!res.ok) {
                throw new Error("Error consultando la factura");
            }

            const data = await res.json();
            setFacturaSeleccionada(data);
            setMostrarModalFactura(true);

        } catch (error) {
            console.error("Error al obtener factura:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la factura',
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
                }
            });
        } finally {
            setLoadingFactura(false);
        }
    };

    const imprimirReporteCierre = (detallesCierre) => {
        if (!detallesCierre) return;

        const formatearNumero = (numero) =>
            new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            }).format(numero || 0);

        const formatearFechaHora = (fecha) =>
            new Date(fecha).toLocaleString('es-CO');

        const ventana = window.open('', '_blank');

        ventana.document.write(`
        <html>
        <head>
            <title>Cierre de Caja #${detallesCierre.id_cierre}</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    padding: 20px;
                    color: #000;
                }
                h1, h2, h3 {
                    text-align: center;
                    margin: 4px 0;
                }
                hr {
                    border: none;
                    border-top: 1px dashed #000;
                    margin: 10px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 8px;
                }
                th, td {
                    padding: 4px 0;
                    text-align: left;
                }
                th {
                    border-bottom: 1px solid #000;
                }
                .right {
                    text-align: right;
                }
                .center {
                    text-align: center;
                }
                .total {
                    font-weight: bold;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 11px;
                }
            </style>
        </head>
        <body>

            <h2>REPORTE DE CIERRE DE CAJA</h2>
            <h3>Cierre #${detallesCierre.id_cierre}</h3>

            <p class="center">
                Fecha: ${formatearFechaHora(detallesCierre.fecha_cierre)}<br/>
                Usuario: ${detallesCierre.usuario_cierre}
            </p>

            <hr/>

            <table>
                <tr>
                    <td>Efectivo Inicial</td>
                    <td class="right">${formatearNumero(detallesCierre.efectivo_inicial)}</td>
                </tr>
                <tr>
                    <td>Total Ventas</td>
                    <td class="right">${formatearNumero(detallesCierre.total_ventas)}</td>
                </tr>
                <tr>
                    <td>Efectivo Esperado</td>
                    <td class="right">${formatearNumero(detallesCierre.efectivo_esperado)}</td>
                </tr>
                <tr class="total">
                    <td>Diferencia</td>
                    <td class="right">${formatearNumero(detallesCierre.diferencia)}</td>
                </tr>
            </table>

            <hr/>

            <h3>RESUMEN POR MÉTODO DE PAGO</h3>
            <table>
                <tr>
                    <th>Método</th>
                    <th class="right">Transacciones</th>
                    <th class="right">Total</th>
                </tr>
                ${detallesCierre.resumen_metodos_pago?.map(m => `
                    <tr>
                        <td>${m.metodo}</td>
                        <td class="right">${m.cantidad}</td>
                        <td class="right">${formatearNumero(m.total)}</td>
                    </tr>
                `).join('')}
            </table>

            <hr/>

            <h3>VENTAS DEL DÍA</h3>
            <table>
                <tr>
                    <th>#Factura</th>
                    <th>Hora</th>
                    <th>Método</th>
                    <th class="right">Total</th>
                </tr>
                ${detallesCierre.ventas_del_dia?.map(v => `
                    <tr>
                        <td>FAC-${v.id_factura}</td>
                        <td>${formatearFechaHora(v.fecha_venta)}</td>
                        <td>${v.metodo_pago}</td>
                        <td class="right">${formatearNumero(v.total)}</td>
                    </tr>
                `).join('')}
            </table>

            ${detallesCierre.observaciones ? `
                <hr/>
                <h3>OBSERVACIONES</h3>
                <p>${detallesCierre.observaciones}</p>
            ` : ''}

            <div class="footer">
                <p>Reporte generado por el sistema</p>
                <p>${new Date().toLocaleString('es-CO')}</p>
            </div>

            <script>
                window.onload = () => {
                    window.print();
                    window.close();
                };
            </script>

        </body>
        </html>
    `);

        ventana.document.close();
    };

    const onImprimirReporte = (idCierre) => {
        imprimirReporteCierre(detallesCierre);
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




    if (!isOpen || !detallesCierre) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                {/* Header modal */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Detalles del Cierre #{detallesCierre.id_cierre}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {formatearFecha(detallesCierre.fecha_cierre)}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Usuario: {detallesCierre.usuario_cierre}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenido modal */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="ml-3 text-gray-600 dark:text-gray-400">Cargando detalles...</p>
                        </div>
                    ) : (
                        <>
                            {/* Estadísticas principales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow">
                                    <div className="text-sm opacity-90">Efectivo Inicial</div>
                                    <div className="text-2xl font-bold">
                                        {formatearNumero(detallesCierre.efectivo_inicial)}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow">
                                    <div className="text-sm opacity-90">Total Ventas</div>
                                    <div className="text-2xl font-bold">
                                        {formatearNumero(detallesCierre.total_ventas)}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow">
                                    <div className="text-sm opacity-90">Efectivo Esperado</div>
                                    <div className="text-2xl font-bold">
                                        {formatearNumero(detallesCierre.efectivo_esperado)}
                                    </div>
                                </div>
                                <div className={`rounded-xl p-4 text-white shadow ${detallesCierre.diferencia >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                                    <div className="text-sm opacity-90">Diferencia</div>
                                    <div className="text-2xl font-bold">
                                        {formatearNumero(detallesCierre.diferencia)}
                                    </div>
                                </div>
                            </div>

                            {/* Métodos de pago */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Resumen por Método de Pago</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {detallesCierre.resumen_metodos_pago?.map((metodo, index) => (
                                        <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-3xl mb-2">{metodo.icono}</div>
                                                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        {metodo.metodo}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {metodo.cantidad} transacción{metodo.cantidad !== 1 ? 'es' : ''}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                        {formatearNumero(metodo.total)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {detallesCierre.total_ventas > 0
                                                            ? `${((metodo.total / detallesCierre.total_ventas) * 100).toFixed(1)}%`
                                                            : '0%'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Desglose detallado */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Desglose de Ventas</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                                            <span className="text-gray-600 dark:text-gray-400">Ventas en Efectivo</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatearNumero(detallesCierre.total_efectivo)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                                            <span className="text-gray-600 dark:text-gray-400">Transferencias</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatearNumero(detallesCierre.total_transferencias)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                                            <span className="text-gray-600 dark:text-gray-400">Tarjetas</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatearNumero(detallesCierre.total_tarjetas)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                                            <span className="text-gray-600 dark:text-gray-400">Mixto</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatearNumero(detallesCierre.total_mixto)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Estadísticas</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Total Facturas</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {detallesCierre.estadisticas?.total_facturas || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Venta Promedio</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatearNumero(detallesCierre.estadisticas?.venta_promedio || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Venta Máxima</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatearNumero(detallesCierre.estadisticas?.venta_maxima || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Venta Mínima</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatearNumero(detallesCierre.estadisticas?.venta_minima || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ventas del día */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                        Ventas del Día ({detallesCierre.ventas_del_dia?.length || 0})
                                    </h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Total: {formatearNumero(detallesCierre.total_ventas)}
                                    </span>
                                </div>

                                {detallesCierre.ventas_del_dia?.length > 0 ? (
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="max-h-80 overflow-y-auto">
                                            <Table>
                                                <TableHeader className="bg-gray-50 dark:bg-gray-700">
                                                    <TableRow>
                                                        <TableCell isHeader className="p-3 text-left text-sm font-semibold">
                                                            # Factura
                                                        </TableCell>
                                                        <TableCell isHeader className="p-3 text-left text-sm font-semibold">
                                                            Hora
                                                        </TableCell>
                                                        <TableCell isHeader className="p-3 text-right text-sm font-semibold">
                                                            Total
                                                        </TableCell>
                                                        <TableCell isHeader className="p-3 text-left text-sm font-semibold">
                                                            Método de Pago
                                                        </TableCell>
                                                        <TableCell isHeader className="p-3 text-left text-sm font-semibold">
                                                            Cliente
                                                        </TableCell>
                                                        <TableCell isHeader className="p-3 text-center text-sm font-semibold">
                                                            Acciones
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {detallesCierre.ventas_del_dia.map((venta, index) => (
                                                        <TableRow
                                                            key={index}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            {/* Factura */}
                                                            <TableCell className="p-3 align-middle font-medium text-gray-900 dark:text-white">
                                                                FAC-{venta.id_factura}
                                                            </TableCell>

                                                            {/* Hora */}
                                                            <TableCell className="p-3 align-middle text-sm text-gray-500 dark:text-gray-400">
                                                                {formatearHora(venta.fecha_venta)}
                                                            </TableCell>

                                                            {/* Total */}
                                                            <TableCell className="p-3 align-middle text-right font-semibold text-gray-900 dark:text-white">
                                                                {formatearNumero(venta.total)}
                                                            </TableCell>

                                                            {/* Método de pago */}
                                                            <TableCell className="p-3 align-middle">
                                                                <span
                                                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                                                                ${getMetodoPagoStyles(venta.metodo_pago)}`}
                                                                >
                                                                    <IconMetodoPago metodo={venta.metodo_pago} />
                                                                    {venta.metodo_pago}
                                                                </span>
                                                            </TableCell>

                                                            {/* Cliente */}
                                                            <TableCell className="p-3 align-middle text-sm text-gray-500 dark:text-gray-400">
                                                                {venta.nombre_cliente || "Consumidor final"}
                                                            </TableCell>

                                                            {/* Acciones */}
                                                            <TableCell className="p-3 align-middle text-center">
                                                                <button
                                                                    onClick={() => verFactura(venta.id_factura)}
                                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                                    title="Ver factura"
                                                                >
                                                                    <svg
                                                                        className="w-5 h-5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        />
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No hay ventas registradas para este día
                                    </div>
                                )}
                            </div>


                            {/* Observaciones */}
                            {detallesCierre.observaciones && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                                        Observaciones
                                    </h3>

                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                                            {detallesCierre.observaciones}
                                        </p>

                                        {detallesCierre.fecha_actualizacion && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                                Última actualización: {formatearFecha(detallesCierre.fecha_actualizacion)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex gap-3">
                                    {onActualizarObservaciones && (
                                        <button
                                            onClick={() => onActualizarObservaciones(detallesCierre.id_cierre, detallesCierre.observaciones)}
                                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Editar Observaciones
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold shadow transition-all"
                                    >
                                        Cerrar
                                    </button>
                                    {onImprimirReporte && (
                                        <button
                                            onClick={() => onImprimirReporte(detallesCierre.id_cierre)}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-all flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            Imprimir Reporte
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Modal de detalles de factura */}
            <ModalDetallesFactura
                isOpen={mostrarModalFactura}
                onClose={() => setMostrarModalFactura(false)}
                factura={facturaSeleccionada}
            />
        </>


    );
};

export default ModalDetallesCierre;