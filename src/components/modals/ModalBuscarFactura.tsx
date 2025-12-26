import { useState, useEffect } from "react";

interface ModalBuscarFacturaProps {
    isOpen: boolean;
    onClose: () => void;
    onBuscar: (tipo: "id" | "cedula", valor: string) => void;
}

export default function ModalBuscarFactura({ isOpen, onClose, onBuscar }: ModalBuscarFacturaProps) {
    const [tipoBusqueda, setTipoBusqueda] = useState<"id" | "cedula">("id");
    const [valor, setValor] = useState("");
    useEffect(() => {
        if (!isOpen) {
            setValor("");
            setTipoBusqueda("id");
        }
    }, [isOpen]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (valor.trim()) {
            onBuscar(tipoBusqueda, valor.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Buscar Factura Específica
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Ingresa el ID de la factura o la cédula del cliente
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-6">
                            {/* Botones de tipo de búsqueda */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTipoBusqueda("id")}
                                    className={`p-4 rounded-lg border-2 transition-all ${tipoBusqueda === "id"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="font-medium mb-1">Por ID</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Ej: FAC-001
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTipoBusqueda("cedula")}
                                    className={`p-4 rounded-lg border-2 transition-all ${tipoBusqueda === "cedula"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="font-medium mb-1">Por Cédula</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Ej: 123456789
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Campo de entrada */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {tipoBusqueda === "id" ? "Número de Factura" : "Cédula del Cliente"}
                                </label>
                                <input
                                    type="text"
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                    placeholder={
                                        tipoBusqueda === "id"
                                            ? "Ingresa el número de factura"
                                            : "Ingresa la cédula del cliente"
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    autoFocus
                                />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Presiona Enter para buscar
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!valor.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                Buscar Factura
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}