import { useState, useMemo } from "react";

interface AvatarProps {
    src?: string | null;
    initials: string;
    size?: "sm" | "md" | "lg";
    color?: string;
    cacheBuster?: boolean;
}

const generateColorFromInitials = (initials: string): string => {
    const colors = [
        "#6D28D9", "#059669", "#DC2626", "#EA580C", "#2563EB",
        "#7C3AED", "#DB2777", "#0891B2", "#CA8A04", "#16A34A"
    ];

    const charSum = initials.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
};

const formatInitials = (initials: string): string => {
    const clean = initials.replace(/[^a-zA-Z]/g, '').toUpperCase();
    return clean.length <= 2 ? clean : clean.charAt(0) + clean.charAt(clean.length - 1);
};

export function Avatar({
    src,
    initials,
    size = "md",
    color,
    cacheBuster = false,
}: AvatarProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-11 h-11 text-sm",
        lg: "w-20 h-20 text-xl",
    };

    const formattedInitials = formatInitials(initials);
    const avatarColor = color || generateColorFromInitials(formattedInitials);

    // Determinar si mostrar imagen o iniciales
    const showImage = src && !hasError;

    // Construir URL con cacheBuster si es necesario
    const imageUrl = useMemo(() => {
        if (!src) return null;

        // Si es blob URL, usar directamente
        if (src.startsWith('blob:')) {
            return src;
        }

        // Si es ruta relativa, construir URL completa
        if (!src.startsWith('http') && !src.startsWith('data:')) {
            const baseUrl = 'http://localhost:3000';
            const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
            src = `${baseUrl}${normalizedSrc}`;
        }

        // Agregar cache buster si es necesario
        if (cacheBuster && !src.includes('?t=')) {
            return `${src}?t=${Date.now()}`;
        }

        return src;
    }, [src, cacheBuster]);

    const handleError = () => {
        console.warn("Error cargando avatar:", imageUrl);
        setHasError(true);
        setIsLoading(false);
    };

    const handleLoad = () => {
        setHasError(false);
        setIsLoading(false);
    };

    return (
        <div
            className={`flex items-center justify-center rounded-full font-semibold overflow-hidden ${sizes[size]}`}
            style={{ backgroundColor: showImage ? 'transparent' : avatarColor }}
        >
            {showImage && imageUrl ? (
                <>
                    <img
                        src={imageUrl}
                        alt={`Avatar de ${formattedInitials}`}
                        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                        onError={handleError}
                        onLoad={handleLoad}
                        loading="lazy"
                    />
                    {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    )}
                </>
            ) : (
                <span className="text-white select-none">{formattedInitials}</span>
            )}
        </div>
    );
}