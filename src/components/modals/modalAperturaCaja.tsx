import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Swal from 'sweetalert2';

interface ModalAperturaCajaProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (efectivoInicial: string) => Promise<void>;
    loading: boolean;
    cajaAbierta: boolean;
    efectivoInicialActual?: number;
}

export default function ModalAperturaCaja({
    isOpen,
    onClose,
    onSubmit,
    loading,
    cajaAbierta,
    efectivoInicialActual = 0
}: ModalAperturaCajaProps) {
    const [efectivoInicial, setEfectivoInicial] = useState(""); // Número limpio
    const [valorMostrado, setValorMostrado] = useState(""); // Valor formateado para mostrar

    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            const valor = efectivoInicialActual > 0 ? efectivoInicialActual.toString() : "";
            setEfectivoInicial(valor);
            // Mostrar el valor formateado si existe
            setValorMostrado(valor ? formatearNumero(valor) : "");
        }
    }, [isOpen, efectivoInicialActual]);

    // Función para formatear número con separadores de miles
    const formatearNumero = (numero: string): string => {
        const num = parseFloat(numero.replace(/\D/g, ''));
        if (isNaN(num)) return "";
        return num.toLocaleString('es-CO');
    };

    // Función para convertir formato de miles a número limpio
    const convertirFormatoANumero = (formato: string): string => {
        const limpiado = formato.replace(/[$\s,.]/g, '');
        return limpiado;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;

        // Guardar el valor mostrado (con formato)
        setValorMostrado(valor);

        // Convertir a número limpio (sin puntos ni comas)
        const numeroLimpio = convertirFormatoANumero(valor);
        setEfectivoInicial(numeroLimpio);
    };

    const handleBlur = () => {
        // Cuando el input pierde el foco, formatear el número
        if (efectivoInicial) {
            const formateado = formatearNumero(efectivoInicial);
            setValorMostrado(formateado);
        }
    };

    const handleFocus = () => {
        // Cuando el input recibe el foco, mostrar solo el número limpio
        setValorMostrado(efectivoInicial);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convertir a número para validación
        const numero = parseInt(efectivoInicial);

        if (!efectivoInicial || isNaN(numero) || numero <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Monto inválido',
                text: 'Por favor ingrese un monto válido mayor a cero',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#fffbeb',
                iconColor: '#f59e0b',
                color: '#92400e'
            });
            return;
        }

        try {
            await onSubmit(efectivoInicial);
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al abrir caja',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#fef2f2',
                iconColor: '#dc2626',
                color: '#991b1b'
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Apertura de Caja Diaria
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date().toLocaleDateString('es-CO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
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

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Efectivo Inicial *
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                            type="text"
                            value={valorMostrado}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Ingrese el monto"
                            autoFocus={isOpen}
                        />
                    </div>
                    {efectivoInicial && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Monto: ${parseInt(efectivoInicial).toLocaleString('es-CO')}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        disabled={loading}
                    >
                        {cajaAbierta ? 'Cerrar' : 'Cancelar'}
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !efectivoInicial}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Procesando...
                            </>
                        ) : 'Abrir Caja'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}