// src/components/modals/ModalCierreCaja.tsx
import { useState, useEffect } from "react";
import Alert from "../ui/alert/Alert";
import { Modal } from "../ui/modal";

interface ModalCierreCajaProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { efectivoContado: number; observaciones: string }) => Promise<void>;
    loading?: boolean;
    efectivoEsperado: number;
}

export default function ModalCierreCaja({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
    efectivoEsperado
}: ModalCierreCajaProps) {
    const [efectivoContado, setEfectivoContado] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [alertData, setAlertData] = useState<{
        show: boolean;
        variant: "success" | "error" | "warning";
        title: string;
        message: string;
    }>({ show: false, variant: "success", title: "", message: "" });

    // Prevenir scroll del body
    useEffect(() => {
        const restoreBody = (prevOverflow: string, prevPaddingRight: string) => {
            document.body.style.overflow = prevOverflow || "";
            document.body.style.paddingRight = prevPaddingRight || "";
        };

        if (typeof window === "undefined") return;

        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;

        if (isOpen) {
            const scrollBarComp = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = "hidden";
            if (scrollBarComp > 0) document.body.style.paddingRight = `${scrollBarComp}px`;
        } else {
            restoreBody(prevOverflow, prevPaddingRight);
        }

        return () => restoreBody(prevOverflow, prevPaddingRight);
    }, [isOpen]);

    useEffect(() => {
        if (alertData.show) {
            const timer = setTimeout(() => {
                setAlertData({ ...alertData, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [alertData]);

    const formatearNumero = (numero: string) => {
        const num = Number(numero.replace(/[^0-9]/g, ''));
        if (isNaN(num)) return "$ 0";
        return `$ ${num.toLocaleString('es-CO')}`;
    };

    const convertirFormatoANumero = (formato: string) => {
        const limpiado = formato.replace(/[$\s]/g, '');
        const sinPuntos = limpiado.replace(/\./g, '');
        const numero = Number(sinPuntos);
        return isNaN(numero) ? 0 : numero;
    };

    const handleEfectivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setEfectivoContado(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!efectivoContado) {
            setAlertData({
                show: true,
                variant: "warning",
                title: "Campo requerido",
                message: "Por favor ingrese el efectivo contado"
            });
            return;
        }

        const efectivoNum = convertirFormatoANumero(efectivoContado);
        if (efectivoNum <= 0) {
            setAlertData({
                show: true,
                variant: "warning",
                title: "Monto inválido",
                message: "El efectivo contado debe ser mayor a cero"
            });
            return;
        }

        try {
            await onSubmit({
                efectivoContado: efectivoNum,
                observaciones: observaciones.toUpperCase()
            });

            // Reset form on success
            setEfectivoContado("");
            setObservaciones("");
        } catch (error: any) {
            setAlertData({
                show: true,
                variant: "error",
                title: "Error",
                message: error.message || "Error al guardar el cierre"
            });
        }
    };

    if (!isOpen) {
        return alertData.show ? (
            <div className="fixed bottom-4 right-4 z-[100000] w-96 animate-fade-in-up">
                <Alert
                    variant={alertData.variant}
                    title={alertData.title}
                    message={alertData.message}
                    showLink={false}
                />
            </div>
        ) : null;
    }

    const diferencia = convertirFormatoANumero(efectivoContado) - efectivoEsperado;
    const diferenciaColor = diferencia >= 0
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400";

    return (
        <>
            {alertData.show && (
                <div className="fixed bottom-4 right-4 z-[100000] w-96 animate-fade-in-up">
                    <Alert
                        variant={alertData.variant}
                        title={alertData.title}
                        message={alertData.message}
                        showLink={false}
                    />
                </div>
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Finalizar Cierre de Caja
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Ingresa el efectivo físico contado para completar el cierre.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información de referencia */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Referencia del Cierre
                        </h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Efectivo esperado:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    ${efectivoEsperado.toLocaleString('es-CO')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Campos del formulario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Efectivo contado *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="text"
                                value={efectivoContado ? formatearNumero(efectivoContado) : ""}
                                onChange={handleEfectivoChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="$ 0"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Observaciones (opcional)
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Comentarios sobre el cierre..."
                        />
                    </div>

                    {/* Diferencia calculada */}
                    {efectivoContado && (
                        <div className={`p-3 rounded-lg ${diferencia >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Diferencia calculada:
                                </span>
                                <span className={`text-lg font-bold ${diferenciaColor}`}>
                                    ${Math.abs(diferencia).toLocaleString('es-CO')}
                                    <span className="text-sm ml-1">
                                        ({diferencia >= 0 ? 'Sobrante' : 'Faltante'})
                                    </span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !efectivoContado}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Guardando...
                                </>
                            ) : 'Guardar Cierre'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}