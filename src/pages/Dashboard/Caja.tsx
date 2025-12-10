import { useState, useEffect } from "react";
import Swal from "sweetalert2";

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
    const [efectivoFisico, setEfectivoFisico] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
    const [mostrarModalFactura, setMostrarModalFactura] = useState(false);




    // Función para formatear números con separadores de miles
    const formatearNumero = (numero) => {
        const num = Number(numero);
        if (isNaN(num)) return "$ 0";
        return `$ ${num.toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };


    const handleChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        setEfectivoInicial(raw);
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
                const respuesta = await fetch("http://localhost:3000/api/facturas/consecutivo");
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
                const response = await fetch(`http://localhost:3000/api/clientes/cedula/${cedula}`);
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
                text: "Debes elegir un producto antes de continuar"
            });
        }
        if (cantidad > productoSeleccionado.stock) {
            return Swal.fire({
                icon: "error",
                title: "Cantidad no permitida",
                text: `Solo hay ${productoSeleccionado.stock} unidades`
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
                confirmButtonText: "Entendido"
            });
        }
    };

    const agregarProductoLista = async ({ codigoONombre, cantidad, peso, descuento }) => {
        try {
            const resp = await fetch(
                `http://localhost:3000/api/articulos/buscar?q=${encodeURIComponent(codigoONombre)}`
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
                    timer: 2000
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
                confirmButtonText: "Entendido"
            });
            return;
        }
        const totalConIVA = total * 1.19;
        if (montoPago < totalConIVA) {
            Swal.fire({
                icon: "error",
                title: "Pago insuficiente",
                text: `El monto recibido (${formatearNumero(montoPago)}) es menor al total a pagar (${formatearNumero(totalConIVA)}).`,
                confirmButtonText: "Entendido"
            });
            return;
        }
        const result = await Swal.fire({
            title: '¿Confirmar venta?',
            text: `El TOTAL de esta Venta es: ${formatearNumero(totalConIVA)}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, finalizar',
            cancelButtonText: 'Cancelar'
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
                const response = await fetch('http://localhost:3000/api/facturas/guardar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cedula: cedula || null,
                        total: total,
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
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    setProductos([]);
                    setTotal(0);
                    setMontoPago(0);
                    setMontoPagoFormateado("$ 0");
                    setCedula("");
                    setClienteNombre("-");
                    const obtenerConsecutivo = async () => {
                        const resp = await fetch("http://localhost:3000/api/facturas/consecutivo");
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
                    confirmButtonText: "Aceptar"
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
            cancelButtonText: 'No, mantener'
        }).then((result) => {
            if (result.isConfirmed) {
                setProductos([]);
                setTotal(0);
                setMontoPago(0);
                setMontoPagoFormateado("$ 0");
                setCedula("");
                setClienteNombre("-");
                Swal.fire(
                    'Cancelado',
                    'Se ha limpiado el carrito',
                    'success'
                );
            }
        });
    };


    const verificarCajaHoy = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/caja/hoy');
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


    const handleSubmitEfectivoInicial = async () => {
        if (!efectivoInicial || isNaN(efectivoInicial) || Number(efectivoInicial) <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Monto inválido',
                text: 'Por favor ingrese un monto válido',
                confirmButtonColor: '#facc15'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/caja', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    efectivo_inicial: efectivoInicial
                })
            });

            if (response.status === 201) {
                setCajaAbierta(true);
                setBlockAccess(false);
                setShowEfectivoModal(false);

                Swal.fire({
                    icon: 'success',
                    title: 'Caja abierta',
                    text: 'La caja se abrió exitosamente',
                    confirmButtonColor: '#22c55e'
                });
            }
        } catch (error) {

            if (error.response?.status === 400) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data.error,
                    confirmButtonColor: '#ef4444'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al abrir caja',
                    text: 'Ocurrió un error inesperado',
                    confirmButtonColor: '#ef4444'
                });
            }

        } finally {
            setLoading(false);
        }
    };

    // Función para obtener el resumen de ventas del día
    const obtenerVentasDelDia = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/facturas/hoy`);
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
            const total = parseFloat(venta.total) || 0;
            totalVentas += total;

            // Analizar el método de pago (viene como texto)
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
        // Pedir confirmación
        const result = await Swal.fire({
            title: '¿Iniciar cierre de caja?',
            text: 'Se calcularán las ventas del día actual',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, iniciar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            // Si no hay efectivo inicial, preguntar
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
    };

    // Función para finalizar el cierre de caja
    const handleConfirmarCierre = async () => {
        if (!efectivoFisico) return;

        const efectivoContado = convertirFormatoANumero(efectivoFisico);
        const diferencia = efectivoContado - datosCierreCaja.efectivoEsperado;

        try {

            const res = await fetch('http://localhost:3000/api/cierre/guardar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_caja: datosCajaHoy.id_caja,   // <- AQUÍ VA EL CORRECTO
                    efectivo_inicial: datosCierreCaja.efectivoInicial,
                    total_ventas: datosCierreCaja.totalVentas,
                    total_efectivo: datosCierreCaja.totalEfectivo,
                    total_transferencias: datosCierreCaja.totalTransferencias,
                    total_tarjetas: datosCierreCaja.totalTarjetas,
                    total_mixto: datosCierreCaja.totalMixto,
                    efectivo_esperado: datosCierreCaja.efectivoEsperado,
                    efectivo_contado: efectivoContado,
                    diferencia,
                    observaciones: (observaciones || "").toUpperCase(),
                    usuario_cierre: usuarioActual
                })
            });

            if (!res.ok) throw new Error("Error guardando el cierre");

            setShowModalCierre(false);
            setMostrarCierreCaja(false);

            setDatosCierreCaja(prev => ({
                ...prev,
                diferencia
            }));

        } catch (error) {
            console.error("Error al guardar cierre:", error);
        }
    };


    // Función para volver a la vista normal
    const volverACaja = () => {
        setMostrarCierreCaja(false);
    };

    //FUNCIÓN VER FACTURA
    const verFactura = async (idFactura) => {
        try {
            const res = await fetch(`http://localhost:3000/api/facturas/detalles/${idFactura}`);
            if (!res.ok) throw new Error("Error consultando la factura");

            const data = await res.json();
            setFacturaSeleccionada(data);  // factura + detalles
            setMostrarModalFactura(true);

        } catch (error) {
            console.error("Error al obtener factura:", error);
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            {/* Modal de Apertura de Caja - Solo mostrar si NO estamos en cierre de caja */}
            {!mostrarCierreCaja && showEfectivoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Apertura de Caja Diaria
                            </h3>
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Para acceder al módulo de caja, debe establecer el efectivo inicial del día.
                            Esta acción solo se realiza una vez al día.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Efectivo Inicial *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    value={efectivoInicial ? formatearNumero(efectivoInicial) : ""}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Ingrese el monto"
                                />
                            </div>
                            {efectivoInicial && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Monto: ${Number(efectivoInicial).toLocaleString()}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    if (!cajaAbierta) {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Caja no abierta',
                                            text: 'Debe abrir caja para continuar',
                                            confirmButtonColor: '#facc15'
                                        });
                                        return;
                                    }

                                    setShowEfectivoModal(false);
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                disabled={loading}
                            >
                                {cajaAbierta ? 'Cerrar' : 'Cancelar'}
                            </button>
                            <button
                                onClick={handleSubmitEfectivoInicial}
                                disabled={loading || !efectivoInicial}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Procesando...
                                    </span>
                                ) : 'Abrir Caja'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModalCierre && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Finalizar Cierre de Caja
                            </h3>
                            <button
                                onClick={() => setShowModalCierre(false)}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                X
                            </button>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Ingresa el efectivo físico contado para completar el cierre.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Efectivo contado *
                            </label>
                            <input
                                type="text"
                                value={efectivoFisico}
                                onChange={e => setEfectivoFisico(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                placeholder="$ 0"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Observaciones (opcional)
                            </label>
                            <textarea
                                value={observaciones}
                                onChange={e => setObservaciones(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                placeholder="Comentarios sobre el cierre..."
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModalCierre(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={() => handleConfirmarCierre()}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                            >
                                Guardar Cierre
                            </button>
                        </div>

                    </div>
                </div>
            )}


            {mostrarModalFactura && facturaSeleccionada && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
                        {/* Encabezado de factura POS */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white p-4 rounded-t-xl">
                            <div className="text-center">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-left">
                                        <p className="text-xs opacity-90">Andrés GOAT</p>
                                        <p className="text-sm">NIT: 900.123.456-7</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs opacity-90">FACTURA DE VENTA</p>
                                        <p className="text-sm">No. FAC-{facturaSeleccionada.factura.id_factura}</p>
                                    </div>
                                </div>
                                <div className="border-t border-blue-400/30 pt-2 mt-2">
                                    <p className="text-sm">
                                        {new Date(facturaSeleccionada.factura.fecha_venta).toLocaleDateString('es-CO', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-xs opacity-90">
                                        {new Date(facturaSeleccionada.factura.fecha_venta).toLocaleTimeString('es-CO', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Información del cliente */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">CLIENTE</h3>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${facturaSeleccionada.factura.metodo_pago === 'Efectivo'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : facturaSeleccionada.factura.metodo_pago === 'Transferencia'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : facturaSeleccionada.factura.metodo_pago === 'Tarjeta'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}>
                                    {facturaSeleccionada.factura.metodo_pago}
                                </div>
                            </div>
                            <div className="space-y-1 text-sm">
                                <p className="font-medium text-gray-900 dark:text-white">{facturaSeleccionada.factura.nombre}</p>
                                <p className="text-gray-600 dark:text-gray-400">CC/NIT: {facturaSeleccionada.factura.cedula}</p>
                                {facturaSeleccionada.factura.correo && (
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">{facturaSeleccionada.factura.correo}</p>
                                )}
                                {facturaSeleccionada.factura.telefono && (
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">Tel: {facturaSeleccionada.factura.telefono}</p>
                                )}
                            </div>
                        </div>

                        {/* Detalles de productos */}
                        <div className="p-4">
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">DETALLES DE COMPRA</h3>

                                {/* Encabezado de tabla */}
                                <div className="grid grid-cols-12 gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-700">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-5">DESCRIPCIÓN</div>
                                    <div className="col-span-2 text-center">CANT</div>
                                    <div className="col-span-2 text-right">PRECIO</div>
                                    <div className="col-span-2 text-right">TOTAL</div>
                                </div>
                            </div>

                            {/* Lista de productos */}
                            <div className="space-y-2 mb-4">
                                {facturaSeleccionada.detalles.map((item, index) => {
                                    const subtotal = parseFloat(item.cantidad) * parseFloat(item.precio_unitario);
                                    return (
                                        <div key={item.id_detalle} className="grid grid-cols-12 gap-1 text-sm">
                                            <div className="col-span-1 text-gray-600 dark:text-gray-400">{index + 1}</div>
                                            <div className="col-span-5">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">{item.articulo}</p>
                                                {item.codigo_barras && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Cód: {item.codigo_barras}</p>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-center text-gray-900 dark:text-white">
                                                {item.cantidad}
                                            </div>
                                            <div className="col-span-2 text-right text-gray-900 dark:text-white">
                                                ${parseFloat(item.precio_unitario).toLocaleString('es-CO')}
                                            </div>
                                            <div className="col-span-2 text-right font-semibold text-gray-900 dark:text-white">
                                                ${subtotal.toLocaleString('es-CO')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totales */}
                            <div className="border-t border-gray-300 dark:border-gray-600 pt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        ${parseFloat(facturaSeleccionada.factura.total).toLocaleString('es-CO')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">IVA (19%)</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        ${(parseFloat(facturaSeleccionada.factura.total) * 0.19).toLocaleString('es-CO')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
                                    <span className="text-gray-900 dark:text-white">TOTAL</span>
                                    <span className="text-blue-600 dark:text-blue-400">
                                        ${(parseFloat(facturaSeleccionada.factura.total) * 1.19).toLocaleString('es-CO')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer informativo */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                            <div className="text-center space-y-2">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    ¡Gracias por su compra! • Vuelva pronto
                                </p>
                                <div className="flex justify-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Válido para declaración de renta</span>
                                    </div>
                                </div>
                                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                                    <p>Factura generada electrónicamente</p>
                                    <p>Resolución DIAN No. 18764005237485</p>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <button
                                onClick={() => {
                                    // Funcionalidad para imprimir
                                    const printWindow = window.open('', '_blank');
                                    printWindow.document.write(`
                            <html>
                                <head>
                                    <title>Factura FAC-${facturaSeleccionada.factura.id_factura}</title>
                                    <style>
                                        body { font-family: 'Courier New', monospace; padding: 20px; }
                                        .header { text-align: center; margin-bottom: 20px; }
                                        .customer-info { margin-bottom: 15px; }
                                        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                                        .items-table th, .items-table td { padding: 5px; border-bottom: 1px solid #ddd; }
                                        .total { text-align: right; margin-top: 20px; font-weight: bold; }
                                        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                                        @media print {
                                            body { font-size: 12px; }
                                            button { display: none; }
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="header">
                                        <h2>FACTURA POS</h2>
                                        <p>No. FAC-${facturaSeleccionada.factura.id_factura}</p>
                                        <p>${new Date(facturaSeleccionada.factura.fecha_venta).toLocaleString()}</p>
                                    </div>
                                    <div class="customer-info">
                                        <p><strong>Cliente:</strong> ${facturaSeleccionada.factura.nombre}</p>
                                        <p><strong>Cédula:</strong> ${facturaSeleccionada.factura.cedula}</p>
                                        <p><strong>Método de Pago:</strong> ${facturaSeleccionada.factura.metodo_pago}</p>
                                    </div>
                                    <table class="items-table">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cant.</th>
                                                <th>Precio</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${facturaSeleccionada.detalles.map(item => `
                                                <tr>
                                                    <td>${item.articulo}</td>
                                                    <td>${item.cantidad}</td>
                                                    <td>$${parseFloat(item.precio_unitario).toLocaleString()}</td>
                                                    <td>$${(parseFloat(item.cantidad) * parseFloat(item.precio_unitario)).toLocaleString()}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                    <div class="total">
                                        <p>Subtotal: $${parseFloat(facturaSeleccionada.factura.total).toLocaleString()}</p>
                                        <p>IVA (19%): $${(parseFloat(facturaSeleccionada.factura.total) * 0.19).toLocaleString()}</p>
                                        <p>TOTAL: $${(parseFloat(facturaSeleccionada.factura.total) * 1.19).toLocaleString()}</p>
                                    </div>
                                    <div class="footer">
                                        <p>¡Gracias por su compra!</p>
                                        <p>Factura electrónica - Válida para declaración de renta</p>
                                    </div>
                                </body>
                            </html>
                        `);
                                    printWindow.document.close();
                                    printWindow.focus();
                                    printWindow.print();
                                    printWindow.close();
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir
                            </button>
                            <button
                                onClick={() => setMostrarModalFactura(false)}
                                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2 rounded-lg font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenido principal */}
            {!mostrarCierreCaja ? (
                <>
                    {/* Solo mostrar este contenido cuando NO estamos en cierre de caja */}

                    {/* Header con estadísticas - Solo en vista normal */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
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
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 text-white rounded-xl p-3 shadow flex items-center justify-center gap-2 text-sm transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cierre Caja
                        </button>
                    </div>

                    {/* Panel de Efectivo Inicial - Solo en vista normal */}
                    <div className="max-w-8xl mx-auto mb-4">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-xl p-4 text-white shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold">
                                        {cajaAbierta ? 'Caja Abierta' : 'Caja Cerrada'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
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
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Información del Cliente
                                            </h2>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Cliente</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                Agregar Productos
                                            </h2>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Formulario</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2">
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
                                                            const resp = await fetch(`http://localhost:3000/api/articulos/buscar?q=${value}`);
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
                                            <div className="flex items-center gap-2">
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
                                                            <th className="p-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-8/24">Producto</th>
                                                            <th className="p-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-3/24">Cant.</th>
                                                            <th className="p-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-3/24">Peso</th>
                                                            <th className="p-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-4/24">Precio</th>
                                                            <th className="p-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-3/24">Desc.</th>
                                                            <th className="p-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-5/24">Subtotal</th>
                                                            <th className="p-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 w-2/24"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {productos.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={7} className="p-4 text-center text-gray-500 dark:text-gray-400">
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
                                                                    <td className="p-2">
                                                                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate" title={p.nombre}>
                                                                            {p.nombre}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={p.codigo}>
                                                                            {p.codigo}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                                                                            {p.cantidad}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                                            {p.peso} kg
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                                            ${p.precio.toLocaleString()}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                                            {p.descuento}%
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                                                                            ${Number(p.subtotal).toLocaleString("es-CO")}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2">
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
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col">
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
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex justify-between items-center mb-1">
                                                <span>Vendedor:</span>
                                                <span className="font-medium text-gray-900 dark:text-white">Usuario Actual</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Fecha:</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {new Date().toLocaleDateString("es-ES", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }).replace('.', '')}
                                                </span>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                                                <div className="flex items-center gap-2">
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
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Resumen de Efectivo
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-gray-600 dark:text-gray-400">Efectivo inicial</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatearNumero(datosCierreCaja.efectivoInicial)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-gray-600 dark:text-gray-400">+ Ventas en efectivo</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatearNumero(datosCierreCaja.totalEfectivo)}
                                    </span>
                                </div>
                                <div className="pt-3">
                                    <div className="flex justify-between items-center text-lg font-bold bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
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
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Ventas del Día ({datosCierreCaja.ventasDelDia.length})
                            </h3>
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"># Factura</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Método de Pago</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Hora</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {datosCierreCaja.ventasDelDia.map((venta, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        FAC-{venta.id_factura}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-gray-900 dark:text-white">
                                                        {new Date(venta.fecha_venta).toLocaleDateString("es-ES", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                        }).replace('.', '')}

                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {formatearNumero(venta.total)}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${venta.metodo_pago === 'Efectivo'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : venta.metodo_pago === 'Transferencia'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                            : venta.metodo_pago === 'Tarjeta'
                                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        }`}>
                                                        {venta.metodo_pago === 'Efectivo' && '💵'}
                                                        {venta.metodo_pago === 'Transferencia' && '🏦'}
                                                        {venta.metodo_pago === 'Tarjeta' && '💳'}
                                                        {venta.metodo_pago.includes('+') && '🔄'}
                                                        {venta.metodo_pago}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(venta.fecha_venta).toLocaleTimeString('es-CO', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>

                                                <td className="p-3">
                                                    <button
                                                        onClick={() => verFactura(venta.id_factura)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="Ver factura"
                                                    >
                                                        👁️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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