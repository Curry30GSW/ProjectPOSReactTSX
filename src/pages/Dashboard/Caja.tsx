import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ModalAperturaCaja from '../../components/modals/modalAperturaCaja';
import ModalDetallesFactura from '../../components/modals/modalDetallesFactura';
import ModalCierreCaja from '../../components/modals/modalCierreCaja';
import { fetchWithAuth } from "../../components/api/fetchWithAuth";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table';
import { getMetodoPagoStyles } from "../../components/utils/getMetodoPagoStyles";


export default function CajaPOS() {
    // Estados existentes
    const [cedula, setCedula] = useState("");
    const [clienteNombre, setClienteNombre] = useState("-");
    const [buscarProd, setBuscarProd] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [peso, setPeso] = useState("");
    const [descuento, setDescuento] = useState("");
    const [metodoPago, setMetodoPago] = useState("efectivo");
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);
    const [montoPago, setMontoPago] = useState(0);
    const [consecutivo, setConsecutivo] = useState(null);
    const [cambio, setCambio] = useState(0);
    const [montoPagoFormateado, setMontoPagoFormateado] = useState("$ 0");
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    // Estados para cierre de caja
    const [mostrarCierreCaja, setMostrarCierreCaja] = useState(false);
    const [datosCierreCaja, setDatosCierreCaja] = useState({
        efectivoInicial: 0,
        totalVentas: 0,
        totalEfectivo: 0,
        totalTransferencias: 0,
        totalTarjetas: 0,
        totalMixto: 0,
        efectivoEsperado: 0,
        diferencia: 0,
        ventasDelDia: [],
        resumenMetodosPago: []
    });
    const [efectivoInicial, setEfectivoInicial] = useState("");
    const [efectivoInicialFormateado, setEfectivoInicialFormateado] = useState("$ 0");


    const [showEfectivoModal, setShowEfectivoModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cajaAbierta, setCajaAbierta] = useState(false);
    const [blockAccess, setBlockAccess] = useState(true);
    const [datosCajaHoy, setDatosCajaHoy] = useState<any>(null);


    const [showModalCierre, setShowModalCierre] = useState(false);
    // const [efectivoFisico, setEfectivoFisico] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
    const [mostrarModalFactura, setMostrarModalFactura] = useState(false);

    const [fechaHora, setFechaHora] = useState("");
    const [nombreVendedor, setNombreVendedor] = useState("Usuario Actual");



    // Función para formatear números con separadores de miles
    const formatearNumero = (numero) => {
        const num = Number(numero);
        if (isNaN(num)) return "$ 0";
        return `$ ${num.toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };

    // Función para convertir formato de miles a número
    const convertirFormatoANumero = (formato) => {
        const limpiado = formato.replace(/[$\s]/g, '');
        const sinPuntos = limpiado.replace(/\./g, '');
        const numero = Number(sinPuntos);
        return isNaN(numero) ? 0 : numero;
    };

    // Manejar cambio en monto recibido
    const handleMontoPagoChange = (e) => {
        const valorInput = e.target.value;
        if (valorInput === "" || valorInput === "$ ") {
            setMontoPago(0);
            setMontoPagoFormateado("$ 0");
            return;
        }
        if (valorInput === "$ " || valorInput === "$") {
            setMontoPago(0);
            setMontoPagoFormateado("$ 0");
            return;
        }
        const numero = convertirFormatoANumero(valorInput);
        setMontoPago(numero);
        setMontoPagoFormateado(formatearNumero(numero));
    };

    const handleMontoPagoBlur = () => {
        if (montoPago > 0) {
            setMontoPagoFormateado(formatearNumero(montoPago));
        }
    };

    const handleMontoPagoFocus = () => {
        if (montoPago > 0) {
            setMontoPagoFormateado(montoPago.toString());
        } else {
            setMontoPagoFormateado("");
        }
    };


    // Verificar estado de caja al cargar el componente
    useEffect(() => {
        verificarCajaHoy();
    }, []);


    // Calcular cambio cuando cambie montoPago o total
    useEffect(() => {
        const totalConIVA = total * 1.19;
        const nuevoCambio = Math.max(0, montoPago - totalConIVA);
        setCambio(nuevoCambio);
    }, [montoPago, total]);

    const eliminarProducto = (index) => {
        const restar = productos[index].subtotal;
        const nuevosProductos = productos.filter((_, i) => i !== index);
        setProductos(nuevosProductos);
        setTotal(nuevosProductos.reduce((acc, p) => acc + p.subtotal, 0));
    };

    useEffect(() => {
        const obtenerConsecutivo = async () => {
            try {
                const respuesta = await fetchWithAuth("/api/facturas/consecutivo");
                const data = await respuesta.json();
                setConsecutivo(data.numeroFactura);
            } catch (error) {
                console.error("Error al obtener consecutivo:", error);
            }
        };
        obtenerConsecutivo();
    }, []);


    useEffect(() => {
        if (!cedula) {
            setClienteNombre("-");
            return;
        }
        const fetchCliente = async () => {
            try {
                const response = await fetchWithAuth(`/api/clientes/cedula/${cedula}`);
                if (!response.ok) {
                    throw new Error("Cliente no encontrado");
                }
                const data = await response.json();
                setClienteNombre(data.nombre || "-");
            } catch (error) {
                console.error(error);
                setClienteNombre("Cliente NO existe");
            }
        };
        fetchCliente();
    }, [cedula]);

    const agregarProducto = () => {
        if (!productoSeleccionado) {
            return Swal.fire({
                icon: "error",
                title: "Seleccione un producto",
                text: "Debes elegir un producto antes de continuar",
                confirmButtonText: "Entendido",
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
                }
            });
        }

        if (cantidad > productoSeleccionado.stock) {
            return Swal.fire({
                icon: "error",
                title: "Cantidad no permitida",
                text: `Solo hay ${productoSeleccionado.stock} unidades disponibles`,
                confirmButtonText: "Entendido",
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
                }
            });
        }

        const codigoONombre = buscarProd;
        const cant = Number(cantidad);
        const p = Number(peso) || 0;
        const desc = Number(descuento) || 0;

        if (codigoONombre && cant > 0) {
            agregarProductoLista({
                codigoONombre,
                cantidad: cant,
                peso: p,
                descuento: desc,
                metodoPago
            });
            setBuscarProd("");
            setCantidad(1);
            setPeso("");
            setDescuento("");
            setProductoSeleccionado(null);
        } else {
            Swal.fire({
                icon: "error",
                title: "Campos incompletos",
                text: "Por favor, completa todos los campos antes de agregar el producto.",
                confirmButtonText: "Entendido",
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
                }
            });
        }
    };

    const agregarProductoLista = async ({ codigoONombre, cantidad, peso, descuento }) => {
        try {
            const resp = await fetchWithAuth(
                `/api/articulos/buscar?q=${encodeURIComponent(codigoONombre)}`
            );
            if (!resp.ok) {
                throw new Error(`Error HTTP: ${resp.status}`);
            }
            const data = await resp.json();
            const productosEncontrados = data.data || data;
            if (!productosEncontrados || productosEncontrados.length === 0) {
                Swal.fire({
                    icon: "error",
                    title: "Producto no encontrado",
                    text: "No se encontró el producto en la base de datos.",
                    confirmButtonText: "Aceptar",
                    timer: 2000,
                    confirmButtonColor: '#ef4444',
                    customClass: {
                        popup: 'dark:bg-gray-900',
                        title: 'dark:text-white',
                        htmlContainer: 'dark:text-gray-300',
                        confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
                    }
                });
                return;
            }
            const producto = productosEncontrados[0];
            setProductos((prev) => {
                const existe = prev.find((p) => p.codigo === producto.codigo_barras);
                if (existe) {
                    const nuevos = prev.map((p) => {
                        if (p.codigo === producto.codigo_barras) {
                            const nuevaCantidad = p.cantidad + cantidad;
                            const nuevoPeso = p.peso + peso;
                            const nuevoSubtotal = producto.precio * nuevaCantidad * (1 - descuento / 100);
                            return {
                                ...p,
                                cantidad: nuevaCantidad,
                                peso: nuevoPeso,
                                descuento: descuento,
                                subtotal: nuevoSubtotal
                            };
                        }
                        return p;
                    });
                    const nuevoTotal = nuevos.reduce((acc, p) => acc + p.subtotal, 0);
                    setTotal(nuevoTotal);
                    return nuevos;
                } else {
                    const nuevoProducto = {
                        id_articulo: producto.id_articulo,
                        codigo: producto.codigo_barras,
                        nombre: producto.descripcion,
                        cantidad: cantidad,
                        peso: peso,
                        precio: producto.precio,
                        descuento: descuento,
                        subtotal: producto.precio * cantidad * (1 - descuento / 100)
                    };
                    const nuevaLista = [...prev, nuevoProducto];
                    const nuevoTotal = nuevaLista.reduce((acc, p) => acc + p.subtotal, 0);
                    setTotal(nuevoTotal);
                    return nuevaLista;
                }
            });
        } catch (error) {
            console.error("Error al agregar producto:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un error al intentar agregar el producto.",
                confirmButtonText: "Aceptar"
            });
        }
    };

    const finalizarVenta = async () => {
        if (productos.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Carrito vacío",
                text: "Agrega productos antes de finalizar la venta.",
                confirmButtonText: "Entendido",
                timer: 2000,
                confirmButtonColor: '#f59e0b',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-yellow-600 dark:hover:bg-yellow-700'
                }
            });
            return;
        }

        const totalConIVA = total * 1.19;

        if (montoPago < totalConIVA) {
            Swal.fire({
                icon: "error",
                title: "Pago insuficiente",
                text: `El monto recibido (${formatearNumero(montoPago)}) es menor al total a pagar (${formatearNumero(totalConIVA)}).`,
                confirmButtonText: "Entendido",
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
                }
            });
            return;
        }

        const result = await Swal.fire({
            title: '¿Confirmar venta?',
            text: `El TOTAL de esta Venta es: ${formatearNumero(totalConIVA)}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, finalizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            customClass: {
                popup: 'dark:bg-gray-900',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-gray-300',
                confirmButton: 'dark:bg-blue-600 dark:hover:bg-blue-700',
                cancelButton: 'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
            }
        });

        if (result.isConfirmed) {
            try {
                const mapearMetodoPago = (metodo) => {
                    switch (metodo) {
                        case "efectivo": return 1;
                        case "transferencia": return 2;
                        case "tarjeta": return 3;
                        case "mixto": return 4;
                        default: return 0;
                    }
                };

                const metodo_pago = mapearMetodoPago(metodoPago);
                const response = await fetchWithAuth('/api/facturas/guardar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cedula: cedula || null,
                        total: total,
                        totalIva: totalConIVA,
                        id_metodo: metodo_pago,
                        productos: productos.map(p => ({
                            id_articulo: p.id_articulo,
                            cantidad: p.cantidad,
                            descuento: p.descuento,
                            precio: p.precio
                        }))
                    }),
                });

                if (!response.ok) {
                    throw new Error('Error al guardar la factura');
                }

                const data = await response.json();

                Swal.fire({
                    icon: 'success',
                    title: 'Venta exitosa',
                    text: `Factura #${data.id_factura || consecutivo} registrada`,
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#10b981',
                    customClass: {
                        popup: 'dark:bg-gray-900',
                        title: 'dark:text-white',
                        htmlContainer: 'dark:text-gray-300',
                        confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700'
                    }
                }).then(() => {
                    setProductos([]);
                    setTotal(0);
                    setMontoPago(0);
                    setMontoPagoFormateado("$ 0");
                    setCedula("");
                    setClienteNombre("-");

                    const obtenerConsecutivo = async () => {
                        const resp = await fetchWithAuth("/api/facturas/consecutivo");
                        const data = await resp.json();
                        setConsecutivo(data.numeroFactura || data.length + 1);
                    };
                    obtenerConsecutivo();
                });

            } catch (error) {
                console.error("Error al finalizar venta:", error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo completar la venta. Intenta nuevamente.",
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: '#ef4444',
                    customClass: {
                        popup: 'dark:bg-gray-900',
                        title: 'dark:text-white',
                        htmlContainer: 'dark:text-gray-300',
                        confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
                    }
                });
            }
        }
    };


    const cancelarTodo = () => {
        Swal.fire({
            title: '¿Cancelar todo?',
            text: "Se perderán todos los productos agregados",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, mantener',
            customClass: {
                popup: 'dark:bg-gray-900',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-gray-300',
                confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700',
                cancelButton: 'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
                icon: 'dark:text-yellow-400'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                setProductos([]);
                setTotal(0);
                setMontoPago(0);
                setMontoPagoFormateado("$ 0");
                setCedula("");
                setClienteNombre("-");

                Swal.fire({
                    title: 'Cancelado',
                    text: 'Se ha limpiado el carrito',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    customClass: {
                        popup: 'dark:bg-gray-900',
                        title: 'dark:text-white',
                        htmlContainer: 'dark:text-gray-300',
                        confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700',
                        icon: 'dark:text-green-400'
                    }
                });
            }
        });
    };

    const verificarCajaHoy = async () => {
        try {
            const response = await fetchWithAuth('/api/caja/hoy');
            const data = await response.json();

            if (data.existe) {
                setCajaAbierta(true);
                setBlockAccess(false);
                setDatosCajaHoy(data.datos);
                setEfectivoInicial(data.datos.efectivo_inicial.toString());
                setEfectivoInicialFormateado(formatearNumero(data.datos.efectivo_inicial));
            } else {
                setCajaAbierta(false);
                setBlockAccess(true);
                setShowEfectivoModal(true);
            }
        } catch (error) {
            console.error('Error al verificar caja:', error);
            setShowEfectivoModal(true);
        }
    };

    // Función que recibe el parametro de efectivo inicial desde el modal de apertura de caja
    const handleSubmitEfectivoInicial = async (valor: string) => {
        // limpiar cualquier símbolo: $, puntos, comas, espacios
        const limpio = valor.replace(/[$\s,.]/g, "");

        if (!limpio || isNaN(Number(limpio)) || Number(limpio) <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Monto inválido',
                html: `
                <div class="text-center">
                    <p>Por favor ingrese un monto válido mayor a cero</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Valor ingresado: "${valor || 'vacío'}"
                    </p>
                </div>
            `,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#f59e0b',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white text-lg font-semibold',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-yellow-600 dark:hover:bg-yellow-700 px-6 py-2.5 rounded-lg font-medium'
                },
                buttonsStyling: false
            });
            return;
        }

        const montoNumerico = Number(limpio);

        // Mostrar loader mientras procesa
        Swal.fire({
            title: 'Abriendo caja...',
            text: 'Procesando apertura de caja diaria',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            customClass: {
                popup: 'dark:bg-gray-900',
                title: 'dark:text-white'
            }
        });

        setLoading(true);

        try {
            const response = await fetchWithAuth('/api/caja', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    efectivo_inicial: montoNumerico
                })
            });

            Swal.close();

            if (response.status === 201) {
                const data = await response.json();

                setCajaAbierta(true);
                setBlockAccess(false);
                setShowEfectivoModal(false);
                setEfectivoInicial(montoNumerico.toString());
                setEfectivoInicialFormateado(formatearNumero(montoNumerico));

                await verificarCajaHoy();

                Swal.fire({
                    icon: 'success',
                    title: '✅ Caja abierta',
                    html: `
                    <div class="text-center">
                        <p class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                            Apertura exitosa
                        </p>
                        <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg space-y-1">
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                <span class="font-medium">Monto inicial:</span> ${formatearNumero(montoNumerico)}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                <span class="font-medium">Fecha:</span> ${new Date().toLocaleDateString('es-CO')}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                <span class="font-medium">Hora:</span> ${new Date().toLocaleTimeString('es-CO')}
                            </p>
                        </div>
                    </div>
                `,
                    confirmButtonText: 'Continuar',
                    confirmButtonColor: '#10b981',
                    customClass: {
                        popup: 'dark:bg-gray-900',
                        title: 'dark:text-white text-lg font-semibold',
                        htmlContainer: 'dark:text-gray-300',
                        confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700 px-6 py-2.5 rounded-lg font-medium',
                        icon: 'dark:text-green-400'
                    },
                    buttonsStyling: false
                });

            } else {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 400 && errorData.error?.includes('ya existe')) {
                    // Si ya existe una caja abierta hoy
                    Swal.fire({
                        icon: 'info',
                        title: 'Caja ya abierta',
                        html: `
                        <div class="text-center">
                            <p>Ya existe una caja abierta para hoy</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Puede continuar con las ventas normalmente
                            </p>
                        </div>
                    `,
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#3b82f6',
                        customClass: {
                            popup: 'dark:bg-gray-900',
                            title: 'dark:text-white text-lg font-semibold',
                            htmlContainer: 'dark:text-gray-300',
                            confirmButton: 'dark:bg-blue-600 dark:hover:bg-blue-700 px-6 py-2.5 rounded-lg font-medium',
                            icon: 'dark:text-blue-400'
                        },
                        buttonsStyling: false
                    }).then(() => {
                        setCajaAbierta(true);
                        setBlockAccess(false);
                        setShowEfectivoModal(false);
                    });

                } else {
                    throw new Error(errorData.message || errorData.error || `Error HTTP: ${response.status}`);
                }
            }

        } catch (error) {
            console.error("Error al abrir caja:", error);

            Swal.fire({
                icon: 'error',
                title: 'Error al abrir caja',
                html: `
                <div class="text-center">
                    <p class="mb-2">${error.message || 'Ocurrió un error inesperado'}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Monto: ${formatearNumero(montoNumerico)}
                    </p>
                </div>
            `,
                confirmButtonText: 'Reintentar',
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white text-lg font-semibold',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700 px-6 py-2.5 rounded-lg font-medium',
                    icon: 'dark:text-red-400'
                },
                buttonsStyling: false
            });

        } finally {
            setLoading(false);
        }
    };


    // Función para obtener el resumen de ventas del día
    const obtenerVentasDelDia = async () => {
        try {
            const response = await fetchWithAuth(`/api/facturas/hoy`);
            if (!response.ok) {
                throw new Error('Error al obtener ventas del día');
            }
            const ventas = await response.json();
            return ventas;
        } catch (error) {
            console.error("Error al obtener ventas:", error);
            return [];
        }
    };

    // Función para calcular el cierre de caja
    const calcularCierreCaja = async () => {
        const ventas = await obtenerVentasDelDia();

        // Calcular totales por método de pago
        let totalEfectivo = 0;
        let totalTransferencias = 0;
        let totalTarjetas = 0;
        let totalMixto = 0;
        let totalVentas = 0;

        const resumenMetodosPago = [
            { metodo: "Efectivo", cantidad: 0, total: 0, icono: "💵" },
            { metodo: "Transferencia", cantidad: 0, total: 0, icono: "🏦" },
            { metodo: "Tarjeta", cantidad: 0, total: 0, icono: "💳" },
            { metodo: "Mixto", cantidad: 0, total: 0, icono: "🔄" }
        ];

        ventas.forEach(venta => {
            const total = venta.total_iva || 0;
            totalVentas += total;

            const metodoPago = venta.metodo_pago || "";

            if (metodoPago.includes("Efectivo") && metodoPago.includes("Transferencia")) {
                // Mixto: Efectivo + Transferencia
                const montoEfectivo = total * 0.5; // Ajusta según tu lógica de división
                const montoTransferencia = total * 0.5;

                totalEfectivo += montoEfectivo;
                totalTransferencias += montoTransferencia;
                totalMixto += total;

                resumenMetodosPago[3].cantidad += 1;
                resumenMetodosPago[3].total += total;

            } else if (metodoPago.includes("Efectivo") && metodoPago.includes("Tarjeta")) {
                // Mixto: Efectivo + Tarjeta
                const montoEfectivo = total * 0.5;
                const montoTarjeta = total * 0.5;

                totalEfectivo += montoEfectivo;
                totalTarjetas += montoTarjeta;
                totalMixto += total;

                resumenMetodosPago[3].cantidad += 1;
                resumenMetodosPago[3].total += total;

            } else if (metodoPago === "Efectivo") {
                totalEfectivo += total;
                resumenMetodosPago[0].cantidad += 1;
                resumenMetodosPago[0].total += total;

            } else if (metodoPago === "Transferencia") {
                totalTransferencias += total;
                resumenMetodosPago[1].cantidad += 1;
                resumenMetodosPago[1].total += total;

            } else if (metodoPago === "Tarjeta") {
                totalTarjetas += total;
                resumenMetodosPago[2].cantidad += 1;
                resumenMetodosPago[2].total += total;

            } else if (metodoPago === "Mixto") {
                totalMixto += total;
                resumenMetodosPago[3].cantidad += 1;
                resumenMetodosPago[3].total += total;

            } else {
                // Método no reconocido, lo contamos como efectivo por defecto
                console.warn(`Método de pago no reconocido: ${metodoPago}`);
                totalEfectivo += total;
                resumenMetodosPago[0].cantidad += 1;
                resumenMetodosPago[0].total += total;
            }
        });

        // Calcular efectivo esperado
        const efectivoEsperado = parseFloat(efectivoInicial) + totalEfectivo;

        setDatosCierreCaja({
            efectivoInicial: parseFloat(efectivoInicial) || 0,
            totalVentas,
            totalEfectivo,
            totalTransferencias,
            totalTarjetas,
            totalMixto,
            efectivoEsperado,
            diferencia: 0,
            ventasDelDia: ventas,
            resumenMetodosPago
        });

        setMostrarCierreCaja(true);
    };

    // Función para manejar el cierre de caja
    const handleCierreCaja = async () => {
        // Mostrar loader mientras verifica
        Swal.fire({
            title: 'Verificando...',
            text: 'Comprobando estado de cierre',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Verificar si ya existe cierre
            const response = await fetchWithAuth('/api/verificar-hoy');
            const data = await response.json();

            Swal.close();

            if (data.existe) {
                const ultimoCierre = data.cierres[0];
                const fechaCierre = new Date(ultimoCierre.fecha_cierre);
                const fechaHora = fechaCierre.toLocaleString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const colorDiferencia = ultimoCierre.diferencia >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

                await Swal.fire({
                    icon: 'info',
                    title: 'Cierre Ya Realizado',
                    html: `
            <div class="text-left space-y-3">
                <p class="text-gray-600 dark:text-gray-400">Ya existe un cierre registrado para hoy.</p>
                
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    <!-- Info básica -->
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Fecha/Hora</p>
                            <p class="text-sm font-medium dark:text-white">${fechaHora}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Usuario</p>
                            <p class="text-sm font-medium dark:text-white">${ultimoCierre.usuario_cierre}</p>
                        </div>
                    </div>
                    
                    <!-- Totales -->
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Efectivo Esperado</span>
                            <span class="font-medium dark:text-white">${formatearNumero(ultimoCierre.efectivo_esperado)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Efectivo Contado</span>
                            <span class="font-medium dark:text-white">${formatearNumero(ultimoCierre.efectivo_contado)}</span>
                        </div>
                        <div class="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Diferencia</span>
                            <span class="text-lg font-bold ${colorDiferencia}">
                                ${formatearNumero(ultimoCierre.diferencia)}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Observaciones si existen -->
                    ${ultimoCierre.observaciones ? `
                    <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Observaciones</p>
                        <p class="text-sm italic text-gray-700 dark:text-gray-300">"${ultimoCierre.observaciones}"</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#3b82f6',
                    customClass: {
                        popup: 'dark:bg-gray-900',
                        title: 'dark:text-white',
                        htmlContainer: 'dark:text-gray-300',
                        confirmButton: 'dark:bg-blue-600 dark:hover:bg-blue-700'
                    }
                });
                return;
            }
            // Si no existe cierre, continuar con el proceso normal
            const result = await Swal.fire({
                title: '¿Iniciar cierre de caja?',
                text: 'Se calcularán las ventas del día actual',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, iniciar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6b7280',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-blue-600 dark:hover:bg-blue-700',
                    cancelButton: 'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                }
            });

            if (result.isConfirmed) {
                // Resto del código para calcular cierre...
                if (efectivoInicial === 0) {
                    const { value: efectivo } = await Swal.fire({
                        title: 'Efectivo inicial',
                        text: 'Ingresa el efectivo con el que inició la caja hoy',
                        input: 'text',
                        inputValue: efectivoInicialFormateado,
                        showCancelButton: true,
                        confirmButtonText: 'Continuar',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#10b981',
                        cancelButtonColor: '#6b7280',
                        inputValidator: (value) => {
                            const num = convertirFormatoANumero(value);
                            if (num < 0) {
                                return 'El valor debe ser positivo';
                            }
                        },
                        customClass: {
                            popup: 'dark:bg-gray-900',
                            title: 'dark:text-white',
                            htmlContainer: 'dark:text-gray-300',
                            input: 'dark:bg-gray-800 dark:border-gray-700 dark:text-white',
                            confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700',
                            cancelButton: 'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                        }
                    });

                    if (efectivo) {
                        const num = convertirFormatoANumero(efectivo);
                        setEfectivoInicial(num);
                        setEfectivoInicialFormateado(formatearNumero(num));
                    } else {
                        return;
                    }
                }

                await calcularCierreCaja();
            }

        } catch (error) {
            Swal.close();
            console.error("Error al verificar cierre:", error);

            // Mostrar error pero permitir continuar (modo seguro)
            const continueResult = await Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                html: `
                <div class="text-left">
                    <p>No se pudo verificar cierres anteriores.</p>
                    <p class="text-sm text-gray-600 mt-2">¿Desea continuar con el cierre de todos modos?</p>
                </div>
            `,
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280'
            });

            if (continueResult.isConfirmed) {
                // Continuar con el cierre normal
                const confirmResult = await Swal.fire({
                    title: '¿Iniciar cierre de caja?',
                    text: 'Se calcularán las ventas del día actual',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, iniciar',
                    cancelButtonText: 'Cancelar'
                });

                if (confirmResult.isConfirmed) {
                    if (efectivoInicial === 0) {
                        const { value: efectivo } = await Swal.fire({
                            title: 'Efectivo inicial',
                            text: 'Ingresa el efectivo con el que inició la caja hoy',
                            input: 'text',
                            inputValue: efectivoInicialFormateado,
                            showCancelButton: true,
                            confirmButtonText: 'Continuar',
                            cancelButtonText: 'Cancelar',
                            inputValidator: (value) => {
                                const num = convertirFormatoANumero(value);
                                if (num < 0) {
                                    return 'El valor debe ser positivo';
                                }
                            }
                        });

                        if (efectivo) {
                            const num = convertirFormatoANumero(efectivo);
                            setEfectivoInicial(num);
                            setEfectivoInicialFormateado(formatearNumero(num));
                        } else {
                            return;
                        }
                    }

                    await calcularCierreCaja();
                }
            }
        }
    };

    // Función para finalizar el cierre de caja
    const handleConfirmarCierre = async ({
        efectivoContado,
        observaciones = ""
    }: {
        efectivoContado: number;
        observaciones?: string
    }) => {
        if (!efectivoContado || efectivoContado <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'El efectivo contado debe ser mayor a cero',
                confirmButtonColor: '#f59e0b',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white text-lg font-semibold',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-yellow-600 dark:hover:bg-yellow-700 px-6 py-2.5 rounded-lg font-medium'
                },
                buttonsStyling: false
            });
            return;
        }

        const diferencia = efectivoContado - datosCierreCaja.efectivoEsperado;

        try {
            setLoading(true);

            const res = await fetchWithAuth('/api/cierre/guardar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_caja: datosCajaHoy.id_caja,
                    efectivo_inicial: datosCierreCaja.efectivoInicial,
                    total_ventas: datosCierreCaja.totalVentas,
                    total_efectivo: datosCierreCaja.totalEfectivo,
                    total_transferencias: datosCierreCaja.totalTransferencias,
                    total_tarjetas: datosCierreCaja.totalTarjetas,
                    total_mixto: datosCierreCaja.totalMixto,
                    efectivo_esperado: datosCierreCaja.efectivoEsperado,
                    efectivo_contado: efectivoContado,
                    diferencia,
                    observaciones: observaciones.toUpperCase(),
                    usuario_cierre: nombreVendedor || "Desconocido"
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Error HTTP: ${res.status}`);
            }

            const data = await res.json();
            const idCierre = data.id_cierre;


            // Éxito
            Swal.fire({
                icon: 'success',
                title: '¡Cierre exitoso!',
                text: '¿Desea imprimir el cierre de caja?',
                showCancelButton: true,
                confirmButtonText: 'Sí, imprimir',
                cancelButtonText: 'No',
                confirmButtonColor: '#22c55e',
                cancelButtonColor: '#6b7280',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white text-lg font-semibold',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton:
                        'dark:bg-green-600 dark:hover:bg-green-700 dark:text-white px-6 py-2.5 rounded-lg font-medium',
                    cancelButton:
                        'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-6 py-2.5 rounded-lg font-medium',
                    icon: 'dark:text-green-400'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                    imprimirCierre(idCierre);
                }
            });


            setShowModalCierre(false);
            setMostrarCierreCaja(false);

            setDatosCierreCaja(prev => ({
                ...prev,
                diferencia
            }));

        } catch (error) {
            console.error("Error al guardar cierre:", error);

            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: error.message || 'No se pudo guardar el cierre de caja',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Entendido',
                customClass: {
                    popup: 'dark:bg-gray-900',
                    title: 'dark:text-white text-lg font-semibold',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'dark:bg-yellow-600 dark:hover:bg-yellow-700 px-6 py-2.5 rounded-lg font-medium'
                },
                buttonsStyling: false
            });

            throw error; // Propagar el error

        } finally {
            setLoading(false);
        }
    };


    const imprimirCierre = async (idCierre: number) => {
        try {
            const res = await fetchWithAuth(
                `/api/cierres/detalles/${idCierre}`
            );

            const json = await res.json();
            if (!json.success) throw new Error('No se pudo obtener el cierre');

            const cierre = json.data;

            const printWindow = window.open('', '_blank', 'width=800,height=600');

            if (!printWindow) return;

            printWindow.document.write(`
      <html>
        <head>
          <title>Cierre de Caja #${cierre.id_cierre}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              padding: 20px;
            }
            h1, h2 {
              text-align: center;
              margin: 0;
            }
            hr {
              margin: 12px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 6px;
              text-align: left;
            }
            th {
              background: #f3f4f6;
            }
            .right {
              text-align: right;
            }
            .difference-positive {
              color: #10b981;
              font-weight: bold;
            }
            .difference-negative {
              color: #ef4444;
              font-weight: bold;
            }
            .difference-zero {
              color: #6b7280;
              font-weight: bold;
            }
          </style>
        </head>
        <body>

          <h1>CIERRE DE CAJA</h1>
          <h2>#${cierre.id_cierre}</h2>

          <hr />

          <p><strong>Caja:</strong> ${cierre.id_caja}</p>
          <p><strong>Usuario:</strong> ${cierre.usuario_cierre}</p>
          <p><strong>Fecha cierre:</strong> ${new Date(cierre.fecha_cierre).toLocaleString('es-CO')}</p>
          ${cierre.observaciones ? `<p><strong>Observaciones:</strong> ${cierre.observaciones}</p>` : ''}

          <hr />

          <table>
            <tr><th>Efectivo inicial</th><td class="right">${formatearNumero(cierre.efectivo_inicial)}</td></tr>
            <tr><th>Total ventas</th><td class="right">${formatearNumero(cierre.total_ventas)}</td></tr>
            <tr><th>Efectivo esperado</th><td class="right">${formatearNumero(cierre.efectivo_esperado)}</td></tr>
            <tr><th>Efectivo contado</th><td class="right">${formatearNumero(cierre.efectivo_contado)}</td></tr>
            <tr>
              <th>Diferencia</th>
              <td class="right">
                <span class="${cierre.diferencia > 0 ? 'difference-positive' : cierre.diferencia < 0 ? 'difference-negative' : 'difference-zero'}">
                  ${formatearNumero(cierre.diferencia)}
                  ${cierre.diferencia > 0 ? '(Sobrante)' : cierre.diferencia < 0 ? '(Faltante)' : '(Exacto)'}
                </span>
              </td>
            </tr>
          </table>

          <hr />

          <h3>Resumen por Métodos de Pago</h3>
          <table>
            <thead>
              <tr>
                <th>Método</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cierre.resumen_metodos_pago?.map(metodo => `
                <tr>
                  <td>${metodo.icono} ${metodo.metodo}</td>
                  <td>${metodo.cantidad}</td>
                  <td class="right">${formatearNumero(metodo.total)}</td>
                </tr>
              `).join('') || ''}
              <tr>
                <td colspan="2" style="text-align: right; font-weight: bold;">TOTAL:</td>
                <td class="right" style="font-weight: bold;">${formatearNumero(cierre.total_ventas)}</td>
              </tr>
            </tbody>
          </table>

          <hr />

          <h3>Ventas del día (${cierre.estadisticas?.total_facturas || cierre.ventas_del_dia?.length || 0})</h3>

          <table>
            <thead>
              <tr>
                <th># Factura</th>
                <th>Cliente</th>
                <th>Método</th>
                <th>Total</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              ${cierre.ventas_del_dia?.map(v => `
                <tr>
                  <td>FAC-${v.id_factura}</td>
                  <td>${v.nombre_cliente || 'Cliente no registrado'}</td>
                  <td>${v.metodo_pago}</td>
                  <td class="right">${formatearNumero(v.total)}</td>
                  <td>${new Date(v.fecha_venta).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          ${cierre.estadisticas ? `
          <hr />
          <h3>Estadísticas</h3>
          <table>
            <tr>
              <th>Venta promedio</th>
              <td class="right">${formatearNumero(cierre.estadisticas.venta_promedio)}</td>
            </tr>
            <tr>
              <th>Venta máxima</th>
              <td class="right">${formatearNumero(cierre.estadisticas.venta_maxima)}</td>
            </tr>
            <tr>
              <th>Venta mínima</th>
              <td class="right">${formatearNumero(cierre.estadisticas.venta_minima)}</td>
            </tr>
          </table>
          ` : ''}

          <hr />
          <div style="text-align: center; font-size: 10px; color: #666; margin-top: 20px;">
            Impreso el: ${new Date().toLocaleString('es-CO')}
          </div>

          <script>
            // Función para formatear números (copia de tu función)
            const formatearNumero = (numero) => {
              const num = Number(numero);
              if (isNaN(num)) return "$ 0";
              return "$ " + num.toLocaleString('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              });
            };
            
            // Aplicar formateo a todos los elementos que tengan datos numéricos
            window.onload = () => {
              // Ya está formateado en el HTML, pero por si acaso
              window.print();
              setTimeout(() => {
                window.close();
              }, 500);
            }
          </script>

        </body>
      </html>
    `);

            printWindow.document.close();

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo imprimir el cierre', 'error');
        }
    };



    // Función para volver a la vista normal
    const volverACaja = () => {
        setMostrarCierreCaja(false);
    };

    //FUNCIÓN VER FACTURA
    const verFactura = async (idFactura) => {
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

    // Obtener nombre del usuario desde sessionStorage
    useEffect(() => {
        const obtenerUsuario = () => {
            try {
                const userData = sessionStorage.getItem("user");
                if (userData) {
                    const user = JSON.parse(userData);
                    if (user && user.name) {
                        setNombreVendedor(user.name);
                    }
                }
            } catch (error) {
                console.error("Error al obtener usuario de sessionStorage:", error);
            }
        };

        obtenerUsuario();
    }, []);

    //Fecha y hora actual
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const fecha = now.toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace('.', '');

            const hora = now.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            setFechaHora(`${fecha} ${hora}`);
        };

        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);


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


    return (

        <div className="h-auto bg-gray-50 dark:bg-gray-900">
            {/* Modal de Apertura de Caja */}
            <ModalAperturaCaja
                isOpen={showEfectivoModal}
                onClose={() => setShowEfectivoModal(false)}
                onSubmit={handleSubmitEfectivoInicial}
                loading={loading}
                cajaAbierta={cajaAbierta}
                efectivoInicialActual={Number(efectivoInicial)}
            />

            <ModalDetallesFactura
                isOpen={mostrarModalFactura}
                onClose={() => setMostrarModalFactura(false)}
                factura={facturaSeleccionada}
            />

            <ModalCierreCaja
                isOpen={showModalCierre}
                onClose={() => setShowModalCierre(false)}
                onSubmit={handleConfirmarCierre}
                loading={loading}
                efectivoEsperado={datosCierreCaja.efectivoEsperado}
            />

            {/* Contenido principal */}
            {!mostrarCierreCaja ? (
                <>
                    <div className="flex justify-between items-center text-md text-gray-700 dark:text-gray-300 mb-4">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Vendedor:</span>
                            <span className="font-medium">{nombreVendedor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Hora:</span>
                            <span className="font-medium">{fechaHora}</span>
                        </div>
                    </div>


                    {/* Header con estadísticas - Solo en vista normal */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-3 text-white shadow">
                            <div className="text-xs opacity-90">N° Factura</div>
                            <div className="text-lg font-bold">
                                {consecutivo !== null ? `FAC-${consecutivo}` : "Cargando..."}
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-3 text-white shadow">
                            <div className="text-xs opacity-90">Subtotal</div>
                            <div className="text-lg font-bold">$ {total.toLocaleString()}</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-3 text-white shadow">
                            <div className="text-xs opacity-90">Artículos</div>
                            <div className="text-lg font-bold">{productos.length}</div>
                        </div>
                        <button
                            onClick={handleCierreCaja}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 text-white rounded-xl p-3 shadow flex items-center justify-center gap-3 text-sm transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cierre Caja
                        </button>
                    </div>

                    {/* Panel de Efectivo Inicial - Solo en vista normal */}
                    <div className="max-w-8xl mx-auto mb-4">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-xl p-3 text-white shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold">
                                        {cajaAbierta ? 'Caja Abierta' : 'Caja Cerrada'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm opacity-90">
                                        {cajaAbierta ? 'Caja abierta correctamente' : 'Esperando apertura...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido del módulo de caja (bloqueado si no hay caja abierta) */}
                    <div className={`${blockAccess ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="max-w-8xl mx-auto">
                            {/* Vista normal de caja */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* PANEL IZQUIERDO - 2/3 del espacio */}
                                <div className="lg:col-span-2 flex flex-col gap-3">
                                    {/* FILA 1: Cliente compacto */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Información del Cliente
                                            </h2>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Cliente</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Cédula / Nit
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cedula}
                                                    onChange={(e) => setCedula(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                    placeholder="Cédula/RUC"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Nombre del Cliente
                                                </label>
                                                <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 truncate">
                                                    {clienteNombre}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FILA 2: Formulario productos compacto */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                Agregar Productos
                                            </h2>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Formulario</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-2">
                                            <div className="relative md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Buscar Producto
                                                </label>
                                                <input
                                                    type="text"
                                                    value={buscarProd}
                                                    onChange={async (e) => {
                                                        const value = e.target.value;
                                                        setBuscarProd(value);
                                                        if (value.trim().length < 2) {
                                                            setSugerencias([]);
                                                            setMostrarSugerencias(false);
                                                            return;
                                                        }
                                                        try {
                                                            const resp = await fetchWithAuth(`/api/articulos/buscar?q=${value}`);
                                                            const data = await resp.json();
                                                            setSugerencias(data.data || []);
                                                            setMostrarSugerencias(true);
                                                        } catch (error) {
                                                            console.error("Error buscando productos:", error);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                    placeholder="Código o nombre"
                                                    onKeyPress={(e) => e.key === 'Enter' && agregarProducto()}
                                                />
                                                {mostrarSugerencias && sugerencias.length > 0 && (
                                                    <ul className="absolute w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50 shadow">
                                                        {sugerencias.map((prod) => {
                                                            const sinStock = prod.stock <= 0;
                                                            return (
                                                                <li
                                                                    key={prod.id_articulo}
                                                                    onClick={() => {
                                                                        if (!sinStock) {
                                                                            setProductoSeleccionado(prod);
                                                                            setBuscarProd(prod.descripcion);
                                                                            setMostrarSugerencias(false);
                                                                        }
                                                                    }}
                                                                    className={`px-3 py-2 text-sm flex justify-between items-center 
                                                                    ${sinStock
                                                                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 cursor-not-allowed opacity-70"
                                                                            : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                                                                        }`}
                                                                >
                                                                    <span>{prod.descripcion}</span>
                                                                    <div className="flex flex-col text-right">
                                                                        <span className={`${sinStock ? "text-red-600 dark:text-red-300" : "text-gray-600 dark:text-gray-300"}`}>
                                                                            ${prod.precio.toLocaleString()}
                                                                        </span>
                                                                        <span className={`text-xs ${sinStock ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                                                            {sinStock ? "Sin stock" : `Stock: ${prod.stock}`}
                                                                        </span>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Cantidad
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={cantidad}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        if (productoSeleccionado && value > productoSeleccionado.stock) {
                                                            Swal.fire({
                                                                icon: "warning",
                                                                title: "Stock insuficiente",
                                                                text: `Solo hay ${productoSeleccionado.stock} unidades disponibles`,
                                                                timer: 2000,
                                                                showConfirmButton: false
                                                            });
                                                            setCantidad(productoSeleccionado.stock);
                                                        } else {
                                                            setCantidad(value);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Peso (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={peso}
                                                    onChange={(e) => setPeso(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                    placeholder="0.0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Desc. %
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={descuento}
                                                    onChange={(e) => setDescuento(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    onClick={agregarProducto}
                                                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 dark:from-yellow-600 dark:to-yellow-700 text-white px-3 py-2 text-sm rounded-lg font-semibold shadow transition-all transform hover:scale-[1.02]"
                                                >
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    Método de Pago:
                                                </label>
                                                <select
                                                    value={metodoPago}
                                                    onChange={(e) => setMetodoPago(e.target.value)}
                                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                >
                                                    <option value="efectivo">💵 Efectivo</option>
                                                    <option value="transferencia">🏦 Transferencia</option>
                                                    <option value="tarjeta">💳 Tarjeta</option>
                                                    <option value="mixto">🔄 Mixto</option>
                                                </select>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {productos.length} productos agregados
                                            </div>
                                        </div>
                                    </div>

                                    {/* FILA 3: Tabla de productos */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden flex flex-col">
                                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                                            <h2 className="text-base font-bold text-gray-800 dark:text-white">Productos en Carrito</h2>
                                        </div>
                                        <div style={{ maxHeight: '330px' }}>
                                            <div className="overflow-y-auto h-full">
                                                <table className="w-full min-w-full">
                                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-8/24">Producto</th>
                                                            <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-3/24">Cant.</th>
                                                            <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-3/24">Peso</th>
                                                            <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-4/24">Precio</th>
                                                            <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-3/24">Desc.</th>
                                                            <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-5/24">Subtotal</th>
                                                            <th className="p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-2/24"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {productos.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={7} className="p-3 text-center text-gray-500 dark:text-gray-400">
                                                                    <div className="flex flex-col items-center justify-center py-8">
                                                                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                                        </svg>
                                                                        <p className="text-sm">No hay productos en el carrito</p>
                                                                        <p className="text-xs text-gray-400">Agrega productos usando el formulario superior</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            productos.map((p, i) => (
                                                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                                    <td className="p-3">
                                                                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate" title={p.nombre}>
                                                                            {p.nombre}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={p.codigo}>
                                                                            {p.codigo}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                                                                            {p.cantidad}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                                            {p.peso} kg
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                                            ${p.precio.toLocaleString()}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                                            {p.descuento}%
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                                                                            ${Number(p.subtotal).toLocaleString("es-CO")}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <button
                                                                            onClick={() => eliminarProducto(i)}
                                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                            title="Eliminar producto"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PANEL DERECHO - 1/3 del espacio */}
                                <div className="flex flex-col gap-3">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3 flex flex-col">
                                        <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">Resumen de Venta</h2>
                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    ${Number(total).toLocaleString("es-CO")}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">IVA (19%)</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    ${(Number(total) * 0.19).toLocaleString("es-CO")}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg font-bold py-2">
                                                <span className="text-gray-900 dark:text-white">Total a Pagar</span>
                                                <span className="text-blue-600 dark:text-blue-400">
                                                    ${(Number(total) * 1.19).toLocaleString("es-CO")}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-36 space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Monto Recibido
                                                </label>
                                                <input
                                                    type="text"
                                                    value={montoPagoFormateado}
                                                    onChange={handleMontoPagoChange}
                                                    onBlur={handleMontoPagoBlur}
                                                    onFocus={handleMontoPagoFocus}
                                                    className="w-full px-3 py-2 text-lg font-bold border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none pr-10"
                                                    placeholder="$ 0"
                                                />
                                            </div>
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-green-800 dark:text-green-300 font-semibold text-sm">Cambio</span>
                                                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                                        ${Number(cambio).toLocaleString("es-CO")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                <button
                                                    onClick={finalizarVenta}
                                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-600 dark:to-green-700 text-white py-2 rounded-lg font-bold text-base shadow transition-all transform hover:scale-[1.02]"
                                                >
                                                    Finalizar Venta
                                                </button>
                                                <button
                                                    onClick={cancelarTodo}
                                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 text-white py-2 rounded-lg font-bold text-sm shadow transition-all"
                                                >
                                                    Cancelar Todo
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* Vista de Cierre de Caja - Muestra SOLO esta vista cuando mostrarCierreCaja es true */
                <div className="max-w-8xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Cierre de Caja
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {new Date().toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <button
                                onClick={() => setMostrarCierreCaja(false)}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all"
                            >
                                Volver a Caja
                            </button>
                        </div>

                        {/* Estadísticas principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow">
                                <div className="text-sm opacity-90">Efectivo Inicial</div>
                                <div className="text-2xl font-bold">
                                    {formatearNumero(datosCierreCaja.efectivoInicial)}
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow">
                                <div className="text-sm opacity-90">Total Ventas</div>
                                <div className="text-2xl font-bold">
                                    {formatearNumero(datosCierreCaja.totalVentas)}
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow">
                                <div className="text-sm opacity-90">Efectivo Esperado</div>
                                <div className="text-2xl font-bold">
                                    {formatearNumero(datosCierreCaja.efectivoEsperado)}
                                </div>
                            </div>
                            <div className={`rounded-xl p-4 text-white shadow ${datosCierreCaja.diferencia >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                                <div className="text-sm opacity-90">Diferencia</div>
                                <div className="text-2xl font-bold">
                                    {formatearNumero(datosCierreCaja.diferencia)}
                                </div>
                            </div>
                        </div>

                        {/* Métodos de pago */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Resumen por Método de Pago</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {datosCierreCaja.resumenMetodosPago.map((metodo, index) => (
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
                                                    {datosCierreCaja.totalVentas > 0
                                                        ? `${((metodo.total / datosCierreCaja.totalVentas) * 100).toFixed(1)}%`
                                                        : '0%'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Desglose de ventas */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Distribución de Ventas</h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Total: {formatearNumero(datosCierreCaja.totalVentas)}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    {
                                        label: "Efectivo",
                                        value: datosCierreCaja.totalEfectivo,
                                        color: "bg-green-500",
                                        icon: "💵"
                                    },
                                    {
                                        label: "Transferencias",
                                        value: datosCierreCaja.totalTransferencias,
                                        color: "bg-blue-500",
                                        icon: "🏦"
                                    },
                                    {
                                        label: "Tarjetas",
                                        value: datosCierreCaja.totalTarjetas,
                                        color: "bg-purple-500",
                                        icon: "💳"
                                    },
                                    {
                                        label: "Mixto",
                                        value: datosCierreCaja.totalMixto,
                                        color: "bg-yellow-500",
                                        icon: "🔄"
                                    }
                                ].filter(item => item.value > 0).map((item, index) => {
                                    const porcentaje = datosCierreCaja.totalVentas > 0
                                        ? (item.value / datosCierreCaja.totalVentas) * 100
                                        : 0;

                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{item.icon}</span>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {formatearNumero(item.value)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                        ({porcentaje.toFixed(1)}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${item.color} transition-all duration-500`}
                                                    style={{ width: `${porcentaje}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Resumen de efectivo */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-6 shadow">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Resumen de Efectivo
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-gray-600 dark:text-gray-400">Efectivo inicial</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatearNumero(datosCierreCaja.efectivoInicial)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-gray-600 dark:text-gray-400">+ Ventas en efectivo</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatearNumero(datosCierreCaja.totalEfectivo)}
                                    </span>
                                </div>
                                <div className="pt-3">
                                    <div className="flex justify-between items-center text-lg font-bold bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-900 dark:text-white">= Efectivo esperado</span>
                                        </div>
                                        <span className="text-blue-600 dark:text-blue-400">
                                            {formatearNumero(datosCierreCaja.efectivoEsperado)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lista de ventas del día */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Ventas del Día ({datosCierreCaja.ventasDelDia.length})
                            </h3>

                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                                    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <TableHeader className="bg-gray-50 dark:bg-gray-700">
                                            <TableRow>
                                                <TableCell isHeader className="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    # Factura
                                                </TableCell>
                                                <TableCell isHeader className="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Fecha
                                                </TableCell>
                                                <TableCell isHeader className="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Total
                                                </TableCell>
                                                <TableCell isHeader className="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Método de Pago
                                                </TableCell>
                                                <TableCell isHeader className="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Hora
                                                </TableCell>
                                                <TableCell isHeader className="px-3 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Acciones
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {datosCierreCaja.ventasDelDia.map((venta, index) => (
                                                <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <TableCell className="px-3 py-3">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            FAC-{venta.id_factura}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="text-gray-900 dark:text-white">
                                                            {new Date(venta.fecha_venta).toLocaleDateString("es-ES", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }).replace('.', '')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            {formatearNumero(venta.total_iva)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div
                                                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium
                                                        ${getMetodoPagoStyles(venta.metodo_pago)}`}
                                                        >
                                                            <IconMetodoPago metodo={venta.metodo_pago} />
                                                            <span>{venta.metodo_pago}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(venta.fecha_venta).toLocaleTimeString('es-CO', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <button
                                                            onClick={() => verFactura(venta.id_factura)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                    text-blue-600 hover:text-white hover:bg-blue-600
                    dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white
                    transition-colors"
                                                            title="Ver factura"
                                                        >
                                                            <svg
                                                                className="w-4 h-4"
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
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5
                        c4.478 0 8.268 2.943 9.542 7
                        -1.274 4.057-5.064 7-9.542 7
                        -4.477 0-8.268-2.943-9.542-7z"
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
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setMostrarCierreCaja(false)}
                                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold shadow transition-all"
                            >
                                Volver a Caja
                            </button>
                            <button
                                onClick={() => setShowModalCierre(true)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                            >
                                Finalizar cierre de caja
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay de bloqueo con mensaje (opcional) - Solo mostrar si NO estamos en cierre de caja */}
            {!mostrarCierreCaja && blockAccess && !showEfectivoModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
                    <div className="text-center p-8 max-w-md">
                        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Caja No Inicializada</h2>
                        <p className="text-gray-300 mb-6">
                            El módulo de caja está bloqueado. Debe establecer el efectivo inicial del día para continuar.
                        </p>
                        <button
                            onClick={() => setShowEfectivoModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            Abrir Caja Ahora
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}