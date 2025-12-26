export const getMetodoPagoStyles = (metodo: string) => {
    const metodoLower = metodo.toLowerCase();

    if (metodoLower.includes("efectivo")) {
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }

    if (metodoLower.includes("transferencia")) {
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }

    if (metodoLower.includes("tarjeta")) {
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    }

    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
};
