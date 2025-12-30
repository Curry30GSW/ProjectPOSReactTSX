import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../components/api/fetchWithAuth";
import { Avatar } from "../ui/avatar/AvatarEdit";
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showConfirm, showWarning, showConfirmDialog } from "../utils/swalConfig";


export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, loading: authLoading, refreshUser } = useAuth(); // Usamos refreshUser en lugar de updateUser
  const [showAvatar, setShowAvatar] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Limpiar preview URL al desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAvatar(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Si no hay usuario o está cargando
  if (authLoading || !user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* Skeleton para avatar */}
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>

            {/* Skeleton para información */}
            <div className="order-3 xl:order-2 flex-1">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 mx-auto xl:mx-0"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto xl:mx-0"></div>
            </div>
          </div>

          {/* Skeleton para botón */}
          <div className="w-full lg:w-auto">
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto lg:mx-0"></div>
          </div>
        </div>
      </div>
    );
  }

  // Obtener iniciales y color para el avatar
  const getInitials = () => {
    if (!user.nombres || !user.apellidos) return "U";
    return `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (initials: string) => {
    const colors = [
      "#6D28D9", "#059669", "#DC2626", "#EA580C", "#2563EB",
      "#7C3AED", "#DB2777", "#0891B2", "#CA8A04", "#16A34A"
    ];
    const charSum = initials.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const initials = getInitials();
  const avatarColor = getAvatarColor(initials);
  const fullName = `${user.nombres} ${user.apellidos}`;

  // Construir URL de la imagen
  const buildImageUrl = (src?: string | null) => {
    if (!src) return null;

    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }

    // Asegurar que la ruta empiece con /
    const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
    return `http://localhost:3000${normalizedSrc}`;
  };

  const handleSave = async () => {
    if (!foto) {
      await showWarning('Atención', 'Por favor selecciona una foto antes de guardar.');
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append("foto_perfil", foto);
      const cedula = String(user.cedula).trim();

      // 1️⃣ Subir la foto
      const res = await fetchWithAuth(
        `/api/empleados/${cedula}/foto`,
        { method: "PUT", body: formData }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al subir foto");
      }

      // 2️⃣ Actualizar datos del usuario en el contexto
      await refreshUser();

      // Limpiar la preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // 3️⃣ Forzar recarga
      setRefreshTrigger(prev => prev + 1);
      setFoto(null);
      closeModal(); // Cerrar modal después de guardar

      await showSuccess('¡Éxito!', 'Foto actualizada correctamente', 1500);

    } catch (error: any) {
      await showError('Error', error.message || 'No se pudo actualizar la foto');
    } finally {
      setUploadLoading(false);
    }
  };

  // Ejecutar botón Modal
  const handleDeleteFoto = () => {
    setIsDeleteModalOpen(true);
  };

  // Funcionalidad del eliminar
  const confirmDeleteFoto = async () => {
    try {
      setIsDeleting(true);

      // Llamar a endpoint DELETE
      const cedula = String(user.cedula).trim();
      const res = await fetchWithAuth(
        `/api/empleados/${cedula}/foto`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Error al eliminar foto");

      // Actualizar datos del usuario en el contexto
      await refreshUser();

      // Forzar recarga
      setRefreshTrigger(prev => prev + 1);

      // Cerrar modal
      setIsDeleteModalOpen(false);

      await showSuccess('¡Eliminada!', 'Foto eliminada correctamente', 1500);

    } catch (error: any) {

      await showError('Error', error.message || 'No se pudo eliminar la foto');
    } finally {
      setIsDeleting(false);
    }
  };

  // Construcción modal (componente ui) 
  const DeletePhotoModal = () => {
    return (
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        className="max-w-md"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6">
          {/* Icono de advertencia */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
            Eliminar foto de perfil
          </h3>

          {/* Descripción */}
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
            ¿Estás seguro de que deseas eliminar tu foto de perfil? Esta acción no se puede deshacer.
          </p>

          {/* Visualización de cambio */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-center flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Actual</p>
                <div className="relative w-14 h-14 mx-auto">
                  <Avatar
                    src={user?.foto_perfil ? buildImageUrl(user.foto_perfil) : null}
                    initials={initials}
                    color={avatarColor}
                    size="md"
                  />
                </div>
              </div>

              <div className="px-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="text-center flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Después</p>
                <div
                  className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: avatarColor }}
                >
                  <span className="text-white font-semibold text-sm">{initials}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Se mostrarán tus iniciales como avatar
            </p>
          </div>

          {/* Detalles importantes */}
          <div className="mb-6 space-y-2">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-300">Esta acción es permanente</span>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-300">Puedes subir una nueva foto en cualquier momento</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteFoto}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Eliminando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Sí, eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // Key única para forzar recarga del Avatar
  const avatarKey = `avatar-${user.cedula}-${refreshTrigger}`;
  const avatarSrc = user.foto_perfil ? buildImageUrl(user.foto_perfil) : null;

  return (
    <>
      {/* Modal para ver foto ampliada */}
      {showAvatar && avatarSrc && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowAvatar(false)}
        >
          <div
            className="relative bg-white rounded-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAvatar(false)}
              className="absolute -top-3 -right-3 text-gray-500 hover:text-black text-xl bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              ✕
            </button>
            <img
              key={`preview-${refreshTrigger}`}
              src={`${avatarSrc}?t=${Date.now()}`}
              alt="Foto de perfil"
              className="max-w-[500px] max-h-[500px] rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 group">
              <div
                onClick={() => avatarSrc && setShowAvatar(true)}
                className={`cursor-pointer ${avatarSrc ? 'hover:opacity-90 transition-opacity' : ''}`}
              >
                <Avatar
                  key={avatarKey}
                  src={avatarSrc}
                  initials={initials}
                  color={avatarColor}
                  size="lg"
                  cacheBuster={true}
                />
              </div>

              {/* Botón para eliminar foto (solo si existe) */}
              {avatarSrc && (
                <button
                  onClick={handleDeleteFoto}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg z-10"
                  title="Eliminar foto"
                >
                  <span className="text-sm font-bold">X</span>
                </button>
              )}
            </div>

            <DeletePhotoModal />

            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {fullName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.cargo}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.correo}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            disabled={uploadLoading || authLoading}
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            {uploadLoading ? "Guardando..." : "Editar"}
          </button>
        </div>
      </div>

      {/* Modal para editar foto */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl p-4 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Foto de Perfil
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Selecciona una nueva imagen para tu perfil.
            </p>
          </div>

          <form className="flex flex-col">
            <div className="custom-scrollbar h-auto px-2 pb-3">
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <div className="mb-4">
                      {foto ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden">
                          <img
                            src={URL.createObjectURL(foto)}
                            alt="Preview de nueva foto"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <Avatar
                          src={avatarSrc}
                          initials={initials}
                          color={avatarColor}
                          size="lg"
                        />
                      )}
                    </div>

                    <div className="w-full max-w-md">
                      <Label>Seleccionar nueva foto</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setFoto(file);

                            // Crear preview URL y limpiar la anterior
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                            }
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:rounded-lg file:border-0
                          file:bg-violet-50 file:px-4 file:py-3
                          file:text-sm file:font-semibold
                          file:text-violet-700 hover:file:bg-violet-100
                          border border-gray-300 rounded-lg p-2"
                        disabled={uploadLoading}
                      />
                      {foto && (
                        <p className="mt-2 text-sm text-green-600">
                          Nueva foto seleccionada: {foto.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                disabled={uploadLoading}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={uploadLoading || !foto}
              >
                {uploadLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}