// src/components/charts/bar/TopClientesChart.tsx
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../components/api/fetchWithAuth";

interface ClienteData {
    anio: number;
    mes: number;
    id_cliente: number;
    nombre: string;
    total_facturas: number;
    total_comprado: string;
}

interface ApiResponse {
    success: boolean;
    data: {
        [key: string]: ClienteData[];
    };
}

export default function BarChartClientes() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clientes, setClientes] = useState<ClienteData[]>([]);
    const [mesActual, setMesActual] = useState('');

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                setLoading(true);
                const response = await fetchWithAuth('/api/top-clientes-mes');

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.data) {
                    const meses = Object.keys(data.data);
                    const mesKey = meses[0] || '';
                    setMesActual(mesKey);

                    const clientesMes = data.data[mesKey] || [];
                    const sortedClientes = [...clientesMes].sort((a, b) =>
                        parseFloat(b.total_comprado) - parseFloat(a.total_comprado)
                    );

                    setClientes(sortedClientes.slice(0, 8));
                }
            } catch (err) {
                console.error('Error:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        fetchClientes();
    }, []);

    // Preparar datos para el gráfico
    const categories = clientes.map(cliente => cliente.nombre);

    const seriesData = clientes.map(cliente => parseFloat(cliente.total_comprado));

    const options: ApexOptions = {
        colors: ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE", "#EFF6FF", "#F3F4F6", "#F9FAFB"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 300,
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
                horizontal: false,
                columnWidth: "50%",
                borderRadius: 6,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -5,
            style: {
                fontSize: '11px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500
            },
            formatter: function (val: number) {
                return `$${val.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Outfit, sans-serif'
                },
                rotate: -45,
            },
            axisBorder: {
                show: true,
            },
            axisTicks: {
                show: true,
            },
        },
        yaxis: {
            title: {
                text: "Total Comprado ($)",
                style: {
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'Outfit, sans-serif'
                }
            },
            labels: {
                style: {
                    fontSize: '11px',
                    fontFamily: 'Outfit, sans-serif'
                },
                formatter: function (val: number) {
                    return `$${val.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                }
            },
        },
        legend: {
            show: false,
        },
        grid: {
            strokeDashArray: 4,
            yaxis: {
                lines: {
                    show: true,
                },
            },
            xaxis: {
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
                fontSize: '12px',
                fontFamily: 'Outfit, sans-serif'
            },
            y: {
                formatter: function (val: number) {
                    return `$${val.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                },
                title: {
                    formatter: function () {
                        return 'Total:';
                    }
                }
            },
        },
        responsive: [{
            breakpoint: 640,
            options: {
                chart: {
                    height: 250
                },
                dataLabels: {
                    enabled: false
                },
                xaxis: {
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: '10px'
                        }
                    }
                }
            }
        }]
    };

    const series = [
        {
            name: "Total Comprado",
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

    const totalComprado = clientes.reduce((sum, cliente) => sum + parseFloat(cliente.total_comprado), 0);
    const totalFacturas = clientes.reduce((sum, cliente) => sum + cliente.total_facturas, 0);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-4">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        Top Clientes del Mes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Clientes con mayor gasto en <span className="font-medium text-blue-600 dark:text-blue-400">{mesActual || 'mes actual'}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm font-medium">
                        {clientes.length} Clientes
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
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Comprado</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    ${totalComprado.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Facturas</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {totalFacturas}
                                </p>
                            </div>
                            <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Promedio por Cliente</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    ${clientes.length > 0 ? (totalComprado / clientes.length).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
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