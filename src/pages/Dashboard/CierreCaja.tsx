import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from "../../components/api/fetchWithAuth";
import Swal from "sweetalert2";
import ModalDetallesCierre from '../../components/modals/ModalDetallesCierre';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "../../components/ui/table";

const GestionCierresCaja = () => {
    const [cierresCaja, setCierresCaja] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetalles, setLoadingDetalles] = useState(false);
    const [filtroFecha, setFiltroFecha] = useState('');
    const [detallesCierre, setDetallesCierre] = useState(null);
    const [mostrarDetalles, setMostrarDetalles] = useState(false);
    const [estadisticas, setestadisticas] = useState(null);

    // Obtener todos los cierres de caja
    useEffect(() => {
        obtenerCierresCaja();
        obtenerestadisticas();
    }, []);

    const obtenerCierresCaja = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth('http://localhost:3000/api/cierres');

            if (response.ok) {
                const data = await response.json();
                // La API devuelve { success, data, total }
                setCierresCaja(data.data || []);
            } else {
                console.error('Error al obtener cierres de caja');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los cierres de caja',
                    confirmButtonColor: '#ef4444',
                    customClass: {
                        popup: 'dark:bg-gray-900',
                        title: 'dark:text-white',
                        htmlContainer: 'dark:text-gray-300',
                        confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
                    }
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const obtenerestadisticas = async () => {
        try {
            const response = await fetchWithAuth('http://localhost:3000/api/cierres/estadisticas');
            if (response.ok) {
                const data = await response.json();
                setestadisticas(data.data);
            }
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
        }
    };

    // Filtrar cierres por fecha
    const filtrarPorFecha = async () => {
        if (!filtroFecha) {
            obtenerCierresCaja();
            return;
        }

        try {
            setLoading(true);
            const response = await fetchWithAuth(
                `http://localhost:3000/api/cierres/filtrar?fecha=${filtroFecha}`
            );


            if (response.ok) {
                const data = await response.json();
                setCierresCaja(data.data || []);
            } else {
                console.error('Error al filtrar cierres');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Formatear fecha
    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Formatear número
    const formatearNumero = (numero) => {
        if (!numero && numero !== 0) return '$ 0';
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(numero);
    };

    // Ver detalles de un cierre
    const verDetalles = async (idCierre) => {
        try {
            setLoadingDetalles(true);
            const response = await fetchWithAuth(`http://localhost:3000/api/cierres/detalles/${idCierre}`);

            if (response.ok) {
                const data = await response.json();
                setDetallesCierre(data.data);
                setMostrarDetalles(true);
            } else {
                console.error('Error al obtener detalles del cierre');
                mostrarError('No se pudieron cargar los detalles del cierre');
            }
        } catch (error) {
            console.error('Error al obtener detalles:', error);
            mostrarError('Error al cargar los detalles');
        } finally {
            setLoadingDetalles(false);
        }
    };

    // Imprimir reporte
    const imprimirReporte = async (idCierre) => {
        try {
            const res = await fetchWithAuth(
                `http://localhost:3000/api/cierres/detalles/${idCierre}`
            );

            if (!res.ok) {
                throw new Error('No se pudo obtener el cierre');
            }

            const { data: detallesCierre } = await res.json();

            if (!detallesCierre) return;

            const formatearNumero = (numero) =>
                new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                }).format(Number(numero) || 0);

            const formatearFechaHora = (fecha) =>
                new Date(fecha).toLocaleString('es-CO', {
                    hour12: true
                });

            const ventana = window.open('', '_blank');

            ventana.document.write(`
<!DOCTYPE html>
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
        h2, h3 {
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

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo imprimir el reporte',
                confirmButtonColor: '#ef4444'
            });
        }
    };


    // Actualizar observaciones
    const actualizarObservaciones = async (idCierre) => {
        const { value: observaciones } = await Swal.fire({
            title: 'Actualizar observaciones',
            input: 'textarea',
            inputLabel: 'Nuevas observaciones',
            inputValue: detallesCierre?.observaciones || '',
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            customClass: {
                popup: 'dark:bg-gray-900',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-gray-300',
                input: 'dark:bg-gray-800 dark:border-gray-700 dark:text-white',
                confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700',
                cancelButton: 'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
            }
        });

        if (observaciones) {
            try {
                const response = await fetchWithAuth(`http://localhost:3000/api/cierres/${idCierre}/observaciones`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ observaciones })
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Observaciones actualizadas',
                        confirmButtonColor: '#10b981',
                        customClass: {
                            popup: 'dark:bg-gray-900',
                            title: 'dark:text-white',
                            htmlContainer: 'dark:text-gray-300',
                            confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700'
                        }
                    });

                    // Actualizar detalles locales
                    if (detallesCierre) {
                        setDetallesCierre({
                            ...detallesCierre,
                            observaciones
                        });
                    }
                }
            } catch (error) {
                console.error('Error al actualizar observaciones:', error);
            }
        }
    };

    // Ordenar por fecha (más reciente primero)
    const cierresOrdenados = [...cierresCaja].sort((a, b) =>
        new Date(b.fecha_cierre) - new Date(a.fecha_cierre)
    );

    return (
        <>
            <div className="flex-1 overflow-hidden">
                <div className="max-w-8xl mx-auto h-full flex flex-col">
                    {/* Header - CONTENIDO SUPERIOR FIJO */}
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-2">
                            Gestión de Cierres de Caja
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Visualiza y gestiona todos los cierres de caja realizados
                        </p>
                    </div>

                    {/* Filtros - CONTENIDO SUPERIOR FIJO */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Filtrar por fecha
                                </label>
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                    Formato: día / mes / año
                                </p>
                                <input
                                    type="date"
                                    value={filtroFecha}
                                    onChange={(e) => setFiltroFecha(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={filtrarPorFecha}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Filtrar
                                </button>
                                <button
                                    onClick={() => {
                                        setFiltroFecha('');
                                        obtenerCierresCaja();
                                    }}
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas - CONTENIDO SUPERIOR FIJO */}
                    {estadisticas && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow">
                                <div className="text-sm opacity-90">Total Cierres</div>
                                <div className="text-2xl font-bold">{estadisticas.total_cierres || 0}</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow">
                                <div className="text-sm opacity-90">Ventas Totales</div>
                                <div className="text-2xl font-bold">
                                    {formatearNumero(estadisticas.ventas_totales || 0)}
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow">
                                <div className="text-sm opacity-90">Efectivo Total</div>
                                <div className="text-2xl font-bold">
                                    {formatearNumero(estadisticas.efectivo_total || 0)}
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow">
                                <div className="text-sm opacity-90">Promedio Ventas</div>
                                <div className="text-2xl font-bold">
                                    {formatearNumero(estadisticas.promedio_ventas || 0)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CONTENEDOR PRINCIPAL DE LA TABLA */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden flex flex-col h-[48vh]">

                        {loading ? (
                            <div className="p-8 text-center h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">
                                    Cargando cierres de caja...
                                </p>
                            </div>
                        ) : cierresOrdenados.length === 0 ? (
                            <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                                <svg
                                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>

                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    No hay cierres de caja registrados
                                </p>

                                {filtroFecha && (
                                    <button
                                        onClick={() => {
                                            setFiltroFecha("");
                                            obtenerCierresCaja();
                                        }}
                                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                        Ver todos los cierres
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* ÚNICO CONTENEDOR CON SCROLL */
                            <div className="flex-1 overflow-y-auto min-h-0">

                                <Table className="w-full">
                                    <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
                                        <TableRow>
                                            <TableCell isHeader className="p-4 text-left text-md font-semibold">
                                                Fecha de Cierre
                                            </TableCell>
                                            <TableCell isHeader className="p-4 text-center text-md font-semibold">
                                                Efectivo Inicial
                                            </TableCell>
                                            <TableCell isHeader className="p-4 text-center text-md font-semibold">
                                                Total Ventas
                                            </TableCell>
                                            <TableCell isHeader className="p-4 text-center text-md font-semibold">
                                                Efectivo Esperado
                                            </TableCell>
                                            <TableCell isHeader className="p-4 text-center text-md font-semibold">
                                                Diferencia
                                            </TableCell>
                                            <TableCell isHeader className="p-4 text-center text-md font-semibold">
                                                Estado
                                            </TableCell>
                                            <TableCell isHeader className="p-4 text-center text-md font-semibold">
                                                Acciones
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {cierresOrdenados.map((cierre) => (
                                            <TableRow
                                                key={cierre.id_cierre}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                {/* Fecha */}
                                                <TableCell className="p-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {formatearFecha(cierre.fecha_cierre)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(cierre.fecha_cierre).toLocaleTimeString(
                                                            "es-CO",
                                                            { hour: "2-digit", minute: "2-digit" }
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Efectivo inicial */}
                                                <TableCell className="p-4 text-center font-semibold">
                                                    {formatearNumero(cierre.efectivo_inicial)}
                                                </TableCell>

                                                {/* Total ventas */}
                                                <TableCell className="p-4 text-center font-semibold">
                                                    {formatearNumero(cierre.total_ventas)}
                                                </TableCell>

                                                {/* Efectivo esperado */}
                                                <TableCell className="p-4 text-center font-semibold">
                                                    {formatearNumero(cierre.efectivo_esperado)}
                                                </TableCell>

                                                {/* Diferencia */}
                                                <TableCell
                                                    className={`p-4 text-center font-bold ${cierre.diferencia >= 0
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-red-600 dark:text-red-400"
                                                        }`}
                                                >
                                                    {formatearNumero(cierre.diferencia)}
                                                </TableCell>

                                                {/* Estado */}
                                                <TableCell className="p-4 text-center">
                                                    <span
                                                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${cierre.diferencia === 0
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : cierre.diferencia > 0
                                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            }`}
                                                    >
                                                        {cierre.diferencia === 0
                                                            ? "Exacto"
                                                            : cierre.diferencia > 0
                                                                ? "Sobrante"
                                                                : "Faltante"}
                                                    </span>
                                                </TableCell>

                                                {/* Acciones */}
                                                <TableCell className="p-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => verDetalles(cierre.id_cierre)}
                                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                                                        >
                                                            Ver
                                                        </button>

                                                        <button
                                                            onClick={() => imprimirReporte(cierre.id_cierre)}
                                                            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                                                        >
                                                            🖨
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                            </div>
                        )}
                    </div>

                </div>
            </div >

            {/* Modal de detalles */}
            < ModalDetallesCierre
                isOpen={mostrarDetalles}
                onClose={() => setMostrarDetalles(false)}
                detallesCierre={detallesCierre}
                loading={loadingDetalles}
                onActualizarObservaciones={actualizarObservaciones}
                onImprimirReporte={imprimirReporte}
            />
        </>
    );
};

export default GestionCierresCaja;