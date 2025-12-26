import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../components/api/fetchWithAuth";

interface ProductoData {
    anio: number;
    mes: number;
    id_articulo: number;
    descripcion: string;
    total_vendido: string;
}

interface ApiResponse {
    success: boolean;
    data: {
        [key: string]: ProductoData[];
    };
}

export default function BarChartProductos() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productos, setProductos] = useState<ProductoData[]>([]);
    const [mesActual, setMesActual] = useState('');

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setLoading(true);
                const response = await fetchWithAuth('http://localhost:3000/api/top-productos-mes');

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                console.log(data);


                if (data.success && data.data) {
                    const meses = Object.keys(data.data);
                    const mesKey = meses[0] || '';
                    setMesActual(mesKey);

                    const productosMes = data.data[mesKey] || [];
                    const sortedProductos = [...productosMes].sort((a, b) =>
                        parseInt(b.total_vendido) - parseInt(a.total_vendido)
                    );

                    setProductos(sortedProductos.slice(0, 8));
                }
            } catch (err) {
                console.error('Error:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []);

    // Preparar datos para el gráfico
    const categories = productos.map(producto =>
        producto.descripcion.length > 15
            ? producto.descripcion.substring(0, 13) + '...'
            : producto.descripcion
    );

    const seriesData = productos.map(producto => parseInt(producto.total_vendido));

    const options: ApexOptions = {
        colors: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5", "#ECFDF5", "#F3F4F6", "#F9FAFB"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 350,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "60%",
                borderRadius: 6,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: true,
            offsetX: 10,
            style: {
                fontSize: '12px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600
            },
            formatter: function (val: number) {
                return val.toLocaleString('es-CO');
            },
        },
        stroke: {
            show: true,
            width: 1,
            colors: ["transparent"],
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Outfit, sans-serif'
                },
                formatter: function (val: number) {
                    return val.toLocaleString('es-CO');
                }
            },
            title: {
                text: "Cantidad Vendida (unidades)",
                style: {
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'Outfit, sans-serif'
                }
            },
        },
        yaxis: {

            labels: {
                style: {
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Outfit, sans-serif'
                },
                formatter: function (value: string) {
                    return value;
                }
            },
        },
        legend: {
            show: false,
        },
        grid: {
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            style: {
                fontSize: '13px',
                fontFamily: 'Outfit, sans-serif'
            },
            y: {
                formatter: function (val: number) {
                    return `${val.toLocaleString('es-CO')} unidades`;
                },
                title: {
                    formatter: function () {
                        return 'Cantidad:';
                    }
                }
            },
        },
        responsive: [{
            breakpoint: 768,
            options: {
                chart: {
                    height: 400
                },
                dataLabels: {
                    enabled: false
                },
                yaxis: {
                    labels: {
                        style: {
                            fontSize: '11px'
                        },
                        formatter: function (value: string) {
                            return value;
                        }
                    }
                }
            }
        }]
    };

    const series = [
        {
            name: "Cantidad Vendida",
            data: seriesData
        }
    ];

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-4">
                <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold text-gray-800 dark:text-white">Error al cargar datos</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const totalVendido = productos.reduce((sum, producto) => sum + parseInt(producto.total_vendido), 0);
    const porcentajeTop = productos.length > 0 && totalVendido > 0
        ? ((parseInt(productos[0].total_vendido) / totalVendido) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-4">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        Top Productos del Mes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Productos más vendidos en <span className="font-medium text-green-600 dark:text-green-400">{mesActual || 'mes actual'}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium">
                        {productos.length} Productos
                    </div>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[500px]">
                    <Chart
                        options={options}
                        series={series}
                        type="bar"
                        height={300}
                    />
                </div>
            </div>

            {/* Estadísticas resumen */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/[0.05]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Vendido</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {totalVendido.toLocaleString('es-CO')} unidades
                                </p>
                            </div>
                            <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Producto Top</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white truncate" title={productos[0]?.descripcion || ''}>
                                    {productos[0]?.descripcion.length > 20
                                        ? productos[0].descripcion.substring(0, 18) + '...'
                                        : productos[0]?.descripcion || 'N/A'}
                                </p>
                            </div>
                            <svg className="w-6 h-6 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Porcentaje Top</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {porcentajeTop}%
                                </p>
                            </div>
                            <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}