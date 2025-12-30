// hooks/useUser.tsx
import { useMemo } from "react";
import { StringColor } from "../components/ui/avatar/AvartarColor";
import { useAuth } from "../context/authContext";

export function useUser() {
  const { user, updateUser } = useAuth();

  const fullName = useMemo(() => {
    if (!user) return "";
    return `${user.nombres} ${user.apellidos}`.trim();
  }, [user]);

  const initiales = useMemo(() => {
    if (!user) return "";
    return (
      (user.nombres?.[0] ?? "") +
      (user.apellidos?.[0] ?? "")
    ).toUpperCase();
  }, [user]);

  const avatarColor = useMemo(() => {
    if (!user) return "#6D28D9";
    return StringColor(user.cedula);
  }, [user]);

  // Agregar timestamp único para forzar recarga de imagen
  const fotoPerfilWithCacheBust = useMemo(() => {
    if (!user?.foto_perfil) return null;
    return `${user.foto_perfil}?t=${Date.now()}`;
  }, [user?.foto_perfil]);

  return { 
    user, 
    updateUser, 
    fullName, 
    initiales, 
    avatarColor,
    fotoPerfilWithCacheBust 
  };
}