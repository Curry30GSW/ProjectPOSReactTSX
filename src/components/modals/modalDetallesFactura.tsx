import { Modal } from "../ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/table/index';
import { fetchWithAuth } from "../../components/api/fetchWithAuth";
import { formatFechaHora } from "../utils/formatFechaHora";

interface DetalleFactura {
    id_detalle: number;
    cantidad: number;
    precio_unitario: string;
    articulo: string;
    codigo_barras: string;
}

interface Factura {
    id_factura: number;
    fecha_venta: string;
    total: string;
    id_cliente: number;
    cedula: string;
    nombre: string;
    correo: string;
    telefono: string;
    metodo_pago: string;
}

interface FacturaCompleta {
    factura: Factura;
    detalles: DetalleFactura[];
}

interface ModalDetallesFacturaProps {
    isOpen: boolean;
    onClose: () => void;
    factura: FacturaCompleta | null;
}

export default function ModalDetallesFactura({
    isOpen,
    onClose,
    factura
}: ModalDetallesFacturaProps) {
    if (!isOpen || !factura) return null;

    const { factura: facturaData, detalles } = factura;


    const formatearNumero = (numero: string | number) => {
        const num = typeof numero === 'string' ? parseFloat(numero) : numero;
        if (isNaN(num)) return "$ 0";
        return `$ ${num.toLocaleString('es-CO')}`;
    };

    // const handleImprimir = () => {
    //     const printWindow = window.open('', '_blank');
    //     printWindow?.document.write(`
    //         <html>
    //             <head>
    //                 <title>Factura FAC-${facturaData.id_factura}</title>
    //                 <style>
    //                     body { font-family: 'Courier New', monospace; padding: 20px; }
    //                     .header { text-align: center; margin-bottom: 20px; }
    //                     .customer-info { margin-bottom: 15px; }
    //                     .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    //                     .items-table th, .items-table td { padding: 5px; border-bottom: 1px solid #ddd; }
    //                     .total { text-align: right; margin-top: 20px; font-weight: bold; }
    //                     .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    //                     @media print {
    //                         body { font-size: 12px; }
    //                         button { display: none; }
    //                     }
    //                 </style>
    //             </head>
    //             <body>
    //                 <div class="header">
    //                     <h2>FACTURA POS</h2>
    //                     <p>No. FAC-${facturaData.id_factura}</p>
    //                     <p>Fecha: ${new Date(facturaData.fecha_venta).toLocaleString()}</p>
    //                 </div>
    //                 <div class="customer-info">
    //                     <p><strong>Cliente:</strong> ${facturaData.nombre}</p>
    //                     <p><strong>Cédula:</strong> ${facturaData.cedula}</p>
    //                     <p><strong>Método de Pago:</strong> ${facturaData.metodo_pago}</p>
    //                 </div>
    //                 <table class="items-table">
    //                     <thead>
    //                         <tr>
    //                             <th>Producto</th>
    //                             <th>Cant.</th>
    //                             <th>Precio</th>
    //                             <th>Subtotal</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         ${detalles.map(item => `
    //                             <tr>
    //                                 <td>${item.articulo}</td>
    //                                 <td>${item.cantidad}</td>
    //                                 <td>$${parseFloat(item.precio_unitario).toLocaleString()}</td>
    //                                 <td>$${(parseFloat(item.cantidad.toString()) * parseFloat(item.precio_unitario)).toLocaleString()}</td>
    //                             </tr>
    //                         `).join('')}
    //                     </tbody>
    //                 </table>
    //                 <div class="total">
    //                     <p>Subtotal: $${parseFloat(facturaData.total).toLocaleString()}</p>
    //                     <p>IVA (19%): $${(parseFloat(facturaData.total) * 0.19).toLocaleString()}</p>
    //                     <p>TOTAL: $${(parseFloat(facturaData.total) * 1.19).toLocaleString()}</p>
    //                 </div>
    //                 <div class="footer">
    //                     <p>¡Gracias por su compra!</p>
    //                     <p>Factura electrónica - Válida para declaración de renta</p>
    //                 </div>
    //             </body>
    //         </html>
    //     `);
    //     printWindow?.document.close();
    //     printWindow?.focus();
    //     printWindow?.print();
    //     printWindow?.close();
    // };

    const handleImprimirFactura = (factura: Factura, detalles: any[]) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Formatear valores numéricos
        const formatearNumero = (numero) => {
            const num = Number(numero);
            if (isNaN(num)) return "$ 0";
            return `$ ${num.toLocaleString('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })}`;
        };

        // Calcular subtotales y IVA
        const subtotal = parseFloat(factura.total);
        const iva = subtotal * 0.19;
        const totalConIva = subtotal * 1.19;

        printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Factura ${factura.id_factura}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Roboto Mono', monospace, 'Courier New';
                    font-size: 11px;
                    line-height: 1.2;
                    width: 80mm;
                    max-width: 80mm;
                    margin: 0 auto;
                    padding: 5mm;
                    color: #000;
                    background: white;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 8px;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 8px;
                }
                
                .company-name {
                    font-weight: bold;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .nit {
                    font-size: 10px;
                    margin: 2px 0;
                }
                
                .address {
                    font-size: 9px;
                    margin: 2px 0;
                }
                
                .document-title {
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin: 8px 0 4px;
                }
                
                .document-info {
                    font-size: 10px;
                    margin: 3px 0;
                }
                
                .section {
                    margin: 8px 0;
                }
                
                .section-title {
                    font-weight: bold;
                    border-bottom: 1px solid #000;
                    margin-bottom: 4px;
                    padding-bottom: 2px;
                }
                
                .customer-info {
                    font-size: 10px;
                    line-height: 1.3;
                }
                
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 8px 0;
                    font-size: 9px;
                }
                
                .items-table th {
                    text-align: left;
                    border-bottom: 1px solid #000;
                    padding: 2px 1px;
                    font-weight: bold;
                }
                
                .items-table td {
                    padding: 3px 1px;
                    vertical-align: top;
                }
                
                .items-table tr:last-child td {
                    border-bottom: 1px solid #000;
                }
                
                .col-code {
                    width: 15%;
                }
                
                .col-desc {
                    width: 40%;
                }
                
                .col-qty {
                    width: 10%;
                    text-align: right;
                }
                
                .col-price {
                    width: 20%;
                    text-align: right;
                }
                
                .col-subtotal {
                    width: 15%;
                    text-align: right;
                }
                
                .totals {
                    margin: 10px 0;
                    font-size: 10px;
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                }
                
                .total-row.bold {
                    font-weight: bold;
                }
                
                .total-row.total {
                    border-top: 1px solid #000;
                    padding-top: 4px;
                    margin-top: 4px;
                }
                
                .payment-info {
                    margin: 10px 0;
                    font-size: 10px;
                }
                
                .footer {
                    margin-top: 15px;
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                    font-size: 8px;
                    text-align: center;
                    line-height: 1.3;
                }
                
                .legal-text {
                    font-size: 7px;
                    margin: 5px 0;
                    text-align: justify;
                }
                
                .qr-container {
                    text-align: center;
                    margin: 10px 0;
                }
                
                .digital-signature {
                    font-family: monospace;
                    font-size: 6px;
                    word-break: break-all;
                    margin: 8px 0;
                    text-align: center;
                }
                
                .barcode {
                    text-align: center;
                    font-family: 'Libre Barcode 128', cursive;
                    font-size: 24px;
                    margin: 10px 0;
                }
                
                .dian-info {
                    font-size: 8px;
                    text-align: center;
                    margin: 5px 0;
                    border: 1px solid #000;
                    padding: 3px;
                }
                
                .return-policy {
                    font-size: 8px;
                    margin: 5px 0;
                    text-align: center;
                }
                
                /* Estilos específicos para impresión */
                @media print {
                    body {
                        width: 80mm !important;
                        max-width: 80mm !important;
                        margin: 0 !important;
                        padding: 2mm !important;
                    }
                    
                    @page {
                        size: 80mm 297mm;
                        margin: 0;
                    }
                }
                
                /* No imprimir botones */
                .no-print {
                    display: none;
                }
            </style>
        </head>
        <body>
            <!-- Encabezado de la empresa -->
            <div class="header">
                <div class="company-name">Andrés GOAT S.A.S</div>
                <div class="nit">NIT: 900190400-0</div>
                <div class="address">033-CIUDAD JARDÍN</div>
                <div class="address">Responsable de IVA</div>
            </div>
            
            <!-- Información del documento -->
            <div class="document-title">FACTURA ELECTRÓNICA DE VENTA</div>
            <div class="document-info">DOCUMENTO: FAC-${String(factura.id_factura).padStart(7, '0')}</div>
            <div class="document-info">Fecha-Hora: ${formatFechaHora(new Date(factura.fecha_venta)).fecha} - ${formatFechaHora(new Date(factura.fecha_venta)).hora}</div>
            <div class="document-info">Caja: TPV${String(factura.id_factura).padStart(5, '0')}</div>
            <div class="document-info">Cnd. Pago: ${factura.metodo_pago || 'Contado'}</div>
            
            <!-- Información del cliente -->
            <div class="section">
                <div class="section-title">INFORMACIÓN DEL CLIENTE</div>
                <div class="customer-info">
                    <div>Cliente: ${factura.nombre}</div>
                    <div>Cédula/NIT: ${factura.cedula}</div>
                </div>
            </div>
            
            <!-- Detalle de productos -->
            <div class="section">
                <div class="section-title">DETALLE DE PRODUCTOS</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="col-code">CÓDIGO</th>
                            <th class="col-desc">DESCRIPCIÓN</th>
                            <th class="col-qty">CANT.</th>
                            <th class="col-price">VALOR</th>
                            <th class="col-subtotal">SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${detalles.map((item, index) => `
                            <tr>
                                <td class="col-code">${item.codigo_barras || index + 1}</td>
                                <td class="col-desc">${item.descripcion || item.articulo || 'Producto'}</td>
                                <td class="col-qty">${item.cantidad}</td>
                                <td class="col-price">${formatearNumero(item.precio_unitario || 0)}</td>
                                <td class="col-subtotal">${formatearNumero((parseFloat(item.cantidad) || 1) * parseFloat(item.precio_unitario || 0))}</td>
                            </tr>
                        `).join('')}
                        
                        ${detalles.length === 0 ? `
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 10px;">
                                    No hay detalles disponibles
                                </td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
            
            <!-- Totales -->
            <div class="section">
                <div class="totals">
                    <div class="total-row">
                        <span>VALOR VENTA:</span>
                        <span>${formatearNumero(subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>DESCUENTO:</span>
                        <span>$0.00</span>
                    </div>
                    <div class="total-row">
                        <span>VENTA SIN IMPUESTO:</span>
                        <span>${formatearNumero(subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>IVA 19%:</span>
                        <span>${formatearNumero(iva)}</span>
                    </div>
                    <div class="total-row bold total">
                        <span>VENTA TOTAL:</span>
                        <span>${formatearNumero(totalConIva)}</span>
                    </div>
                    <div class="total-row">
                        <span>TOTAL ITEMS:</span>
                        <span>${detalles.length}</span>
                    </div>
                </div>
            </div>
            
            <!-- Información de pago -->
            <div class="section">
                <div class="payment-info">
                    <div class="section-title">INFORMACIÓN DE PAGO</div>
                    <div>Método: ${factura.metodo_pago}</div>
                    <div>Recibido: ${formatearNumero(totalConIva)}</div>
                    <div>Cambio: $0.00</div>
                </div>
            </div>
            
            <!-- Políticas de cambio -->
            <div class="return-policy">
                30 días para cambios y 60 para garantías.<br>
                Para cambios traer la ropa nueva y con las etiquetas puestas.<br>
                * IVA del 19% incluido
            </div>
            
            <!-- Autorización DIAN -->
            <div class="dian-info">
                AUTORIZACIÓN NUMERACIÓN DE FACTURACIÓN<br>
                No. 1874610109933<br>
                Numeración AUTORIZADA<br>
                Rango desde: RC33154 hasta RC33100000<br>
                Vigencia: desde 2025/11/05 hasta 2026/11/05 - 12 MESES
            </div>
            
            <!-- Texto legal -->
            <div class="legal-text">
                Otorgando mis datos para la expedición de factura de venta, 
                declaro de manera libre, expresa, inequívoca e informada, 
                que autorizo a MATTERIA S.A.S. a realizar el tratamiento 
                de mis datos personales de acuerdo a su política publicada 
                en la página www.matteria.net/politica-privacidad
            </div>
            
            <!-- Dirección -->
            <div class="footer">
                CRA 100 15A CI Local 400 Aventura Plaza<br>
                Bogotá D.C., Colombia
            </div>
            
            <!-- Información del software -->
            <div class="legal-text" style="text-align: center;">
                Factura generada por software de<br>
                SISTEMA DE INTEGRACIÓN EMPRESARIAL S.A.<br>
                NIT: 890.131.133-3<br>
                PROVEEDOR TECNOLÓGICO Andrés GOAT S.A.S
            </div>
            
            <!-- Código de seguridad (simulado) -->
            <div class="digital-signature">
                &#273b6c0c07&60911194$bbab2cc53f911a4e7f
                c71f5ab8r0d8db1bfdc1bc7343ad8b8336cf66c
                2a6df4cf0fb7b629
            </div>
            
            <!-- Código QR (simulado) -->
            <div class="qr-container">
                <div style="border: 1px solid #000; display: inline-block; padding: 5px;">
                    [CÓDIGO QR]<br>
                    <small>Escanea para validar</small>
                </div>
            </div>
            
            <!-- Firma digital (simulada) -->
            <div class="digital-signature">
                FIRMA DIGITAL<br>
                TwNTGang/64kGVcj1j7h0J1U1ap1h7k1X03rd8nd
                XJKmHdd4c1L1k+42LGoMMwDvpoE6CBbQEh2NH
                3srq7yj1i1c7ymnqb0f7g7f7y7c7mac9mbucqg
                G++rfzg3bWg2h4sq8x38x11zF0W7k7j8b0E8
                Mqj45bm5fkkvv75iaeEh0tb7k8FKGR7bp5b011j
                jADIDGykDoh7kYQak5bgH1BALXaJOyay7d18F8f3
                M48D8kt0f9/f8mH4+qw0n1kxu7c6dmwF9gf5z0
                hdHba/JAwUtbacGngk1z0ff5a1lvlcb8HwyPMnu
                Hpgjy4x8uJWn/un7x0cAm-
            </div>
            
            <!-- Información DIAN -->
            <div class="dian-info">
                FECHA ACEPTACIÓN DIAN:<br>
                ${formatFechaHora(new Date())}
            </div>
            
            <!-- Código de barras (simulado) -->
            <div class="barcode">
                *FAC-${String(factura.id_factura).padStart(5, '0')}*
            </div>
            
            <!-- Código CUFE (simulado) -->
            <div class="digital-signature">
                CUFE: 84123b6c0c07&60911194$bbab2cc53f
                914a4e7f5a715a8b783a4ef4fd1fc63d
                313aGBb8356cf6622e6df4fc0fb7b639
            </div>
            
            <!-- Botón de impresión (solo visible en vista previa) -->
            <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">
                    Imprimir Factura
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; margin-left: 10px;">
                    Cerrar
                </button>
            </div>
            
            <script>
                // Imprimir automáticamente al cargar
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                        // Cerrar después de imprimir (opcional)
                        setTimeout(() => {
                            window.close();
                        }, 1000);
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);

        printWindow.document.close();
    };


    const handleImprimirIndividual = (facturaCompleta: FacturaCompleta) => {
        // Primero necesitas obtener los detalles de la factura
        const fetchDetallesFactura = async () => {
            try {
                const response = await fetchWithAuth(`/api/facturas/detalles/${facturaCompleta.factura.id_factura}`);
                if (!response.ok) throw new Error('Error al obtener detalles');

                const data = await response.json();
                console.log('Datos crudos de la API:', data);
                const detalles = Array.isArray(data) ? data : data.detalles || [];
                console.log('Detalles procesados:', detalles);

                handleImprimirFactura(facturaCompleta.factura, detalles);
            } catch (error) {
                console.error('Error completo:', error);
                // Si no hay detalles, imprimir solo la información básica
                handleImprimirFactura(facturaCompleta.factura, []);
            }
        };

        fetchDetallesFactura();
    };

    const getMetodoPagoClase = (metodo: string) => {
        switch (metodo) {
            case 'Efectivo':
                return 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
            case 'Transferencia':
                return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
            case 'Tarjeta':
                return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
            default:
                return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            {/* Encabezado elegante */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-950 dark:to-black text-white p-6 rounded-t-xl -mx-6 -mt-6 mb-6 relative overflow-hidden">
                {/* Patrón decorativo sutil */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <div className="w-full h-full border-2 border-white rounded-full"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h1 className="text-xl font-bold tracking-tight">DETALLE DE FACTURA</h1>
                            </div>
                            <p className="text-sm text-slate-300">Comprobante oficial de venta</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-300 mb-1">No. FACTURA</div>
                            <div className="text-2xl font-bold tracking-wider">FAC-{facturaData.id_factura}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                        <div>
                            <div className="text-xs text-slate-300 mb-1">FECHA Y HORA</div>
                            <div className="font-medium">
                                {new Date(facturaData.fecha_venta).toLocaleDateString('es-CO', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                                <span className="text-slate-300 mx-2">•</span>
                                {new Date(facturaData.fecha_venta).toLocaleTimeString('es-CO', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-300 mb-1">EMPRESA</div>
                            <div className="font-medium">Andrés GOAT</div>
                            <div className="text-xs text-slate-300">NIT: 900.190.4200-0</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información del cliente - Estilo tarjeta */}
            <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-5 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">INFORMACIÓN DEL CLIENTE</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Datos del comprador</p>
                        </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getMetodoPagoClase(facturaData.metodo_pago)}`}>
                        {facturaData.metodo_pago}
                    </div>
                </div>

                <div className="space-y-3 pl-13">
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">NOMBRE COMPLETO</div>
                        <div className="font-medium text-slate-900 dark:text-white">{facturaData.nombre}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">IDENTIFICACIÓN</div>
                            <div className="font-medium text-slate-900 dark:text-white">{facturaData.cedula}</div>
                        </div>
                        {facturaData.correo && (
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">CORREO</div>
                                <div className="font-medium text-slate-900 dark:text-white truncate">{facturaData.correo}</div>
                            </div>
                        )}
                        {facturaData.telefono && (
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">TELÉFONO</div>
                                <div className="font-medium text-slate-900 dark:text-white">{facturaData.telefono}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detalles de productos - Estilo tabla minimalista */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">DETALLES DE LA COMPRA</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{detalles.length} producto(s)</p>
                        </div>
                    </div>
                </div>

                {/* Tabla de productos */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden p-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <TableCell isHeader className="text-center">#</TableCell>
                                <TableCell isHeader>PRODUCTO</TableCell>
                                <TableCell isHeader className="text-center">CANTIDAD</TableCell>
                                <TableCell isHeader className="text-right">PRECIO UNIT.</TableCell>
                                <TableCell isHeader className="text-right">SUBTOTAL</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {detalles.map((item, index) => {
                                const subtotal = parseFloat(item.cantidad.toString()) * parseFloat(item.precio_unitario);
                                return (
                                    <TableRow
                                        key={item.id_detalle}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        {/* # */}
                                        <TableCell className="text-center align-middle text-sm text-slate-500 dark:text-slate-400">
                                            {index + 1}
                                        </TableCell>

                                        {/* Artículo */}
                                        <TableCell className="align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {item.articulo}
                                                </span>
                                                {item.codigo_barras && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        Código: {item.codigo_barras}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Cantidad */}
                                        <TableCell className="text-center align-middle">
                                            <span className="inline-flex justify-center min-w-[40px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-medium text-slate-900 dark:text-white">
                                                {item.cantidad}
                                            </span>
                                        </TableCell>

                                        {/* Precio unitario */}
                                        <TableCell className="text-right align-middle text-sm text-slate-900 dark:text-white">
                                            ${parseFloat(item.precio_unitario).toLocaleString('es-CO')}
                                        </TableCell>

                                        {/* Subtotal */}
                                        <TableCell className="text-right align-middle text-sm font-semibold text-slate-900 dark:text-white">
                                            ${subtotal.toLocaleString('es-CO')}
                                        </TableCell>
                                    </TableRow>

                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                {/* Totales - Estilo destacado */}
                <div className="mt-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Subtotal</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {formatearNumero(facturaData.total)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">IVA (19%)</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {formatearNumero(parseFloat(facturaData.total) * 0.19)}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">TOTAL A PAGAR</span>
                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatearNumero(parseFloat(facturaData.total) * 1.19)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de acción - Estilo moderno */}
            <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => handleImprimirIndividual(factura)}
                    className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir Factura
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-800 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 dark:text-white py-3 rounded-lg font-medium transition-all"
                >
                    Cerrar Vista
                </button>
            </div>
        </Modal>
    );
}