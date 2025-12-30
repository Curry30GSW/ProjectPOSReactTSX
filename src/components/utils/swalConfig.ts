import Swal from 'sweetalert2';

export const getSwalConfig = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return {
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#e5e7eb' : '#374151',
        iconColor: isDarkMode ? '#3b82f6' : '#2563eb',
        confirmButtonColor: isDarkMode ? '#3b82f6' : '#2563eb',
        cancelButtonColor: isDarkMode ? '#6b7280' : '#9ca3af',
        errorColor: isDarkMode ? '#ef4444' : '#dc2626',
        successColor: isDarkMode ? '#10b981' : '#059669',
        warningColor: isDarkMode ? '#f59e0b' : '#d97706',
        infoColor: isDarkMode ? '#3b82f6' : '#2563eb',
    };
};

export const showLoading = (title: string, text: string = '') => {
    const config = getSwalConfig();
    
    return Swal.fire({
        title,
        text,
        icon: 'info',
        background: config.background,
        color: config.color,
        iconColor: config.iconColor,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

export const showSuccess = (title: string, html?: string, timer: number = 3000) => {
    const config = getSwalConfig();
    
    return Swal.fire({
        title,
        html,
        icon: 'success',
        background: config.background,
        color: config.color,
        iconColor: config.successColor,
        confirmButtonColor: config.confirmButtonColor,
        timer,
        timerProgressBar: true,
    });
};

export const showError = (title: string, error: string) => {
    const config = getSwalConfig();
    
    return Swal.fire({
        title,
        html: `
            <div style="text-align: left;">
                <p>${error}</p>
                <p style="font-size: 0.9rem; color: ${config.color.replace('ff', 'aa')}; margin-top: 1rem;">
                    Por favor, inténtalo de nuevo.
                </p>
            </div>
        `,
        icon: 'error',
        background: config.background,
        color: config.color,
        iconColor: config.errorColor,
        confirmButtonColor: config.confirmButtonColor,
    });
};

export const showConfirm = (title: string, html: string, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar') => {
    const config = getSwalConfig();
    
    return Swal.fire({
        title,
        html,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        background: config.background,
        color: config.color,
        iconColor: config.iconColor,
        confirmButtonColor: config.confirmButtonColor,
        cancelButtonColor: config.cancelButtonColor,
        reverseButtons: true,
    });
};

export const showWarning = (title: string, text: string, timer: number = 3000) => {
    const config = getSwalConfig();
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return Swal.fire({
        title,
        text,
        icon: 'warning',
        timer,
        timerProgressBar: true,
        showConfirmButton: false,
        background: config.background,
        color: config.color,
        iconColor: config.warningColor,
        customClass: {
            popup: `
                backdrop-blur-md
                ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'}
                border ${isDarkMode ? 'border-white/10' : 'border-white/20'}
                rounded-xl
                ${isDarkMode ? 'text-white' : 'text-gray-900'}
                shadow-2xl
            `,
            title: 'text-lg font-semibold',
            htmlContainer: `text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`,
            icon: `text-${isDarkMode ? 'yellow-400' : 'yellow-500'}`
        }
    });
};

export const showConfirmDialog = (
    title: string, 
    html: string, 
    confirmText: string = 'Confirmar', 
    cancelText: string = 'Cancelar',
    icon: 'question' | 'warning' | 'info' = 'question'
) => {
    const config = getSwalConfig();
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const iconColors = {
        question: isDarkMode ? 'text-blue-400' : 'text-blue-500',
        warning: isDarkMode ? 'text-yellow-400' : 'text-yellow-500',
        info: isDarkMode ? 'text-blue-400' : 'text-blue-500'
    };
    
    return Swal.fire({
        title,
        html,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        background: config.background,
        color: config.color,
        iconColor: config.iconColor,
        confirmButtonColor: config.confirmButtonColor,
        cancelButtonColor: config.cancelButtonColor,
        reverseButtons: true,
        customClass: {
            popup: `
                backdrop-blur-md
                ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'}
                border ${isDarkMode ? 'border-white/10' : 'border-white/20'}
                rounded-xl
                ${isDarkMode ? 'text-white' : 'text-gray-900'}
                shadow-2xl
            `,
            title: 'text-lg font-semibold',
            htmlContainer: `text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`,
            icon: iconColors[icon],
            confirmButton: 'px-4 py-2 rounded-lg font-medium',
            cancelButton: 'px-4 py-2 rounded-lg font-medium'
        }
    });
};