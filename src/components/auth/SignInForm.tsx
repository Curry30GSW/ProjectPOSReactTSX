import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import ToastModal from "../ToastModal";
import Swal from "sweetalert2";
import { useAuth } from "../../context/authContext"


export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    if (!cedula || !password) {
      setMensaje("Por favor ingresa los campos");
      return;
    }

    try {
      setIsLoading(true);

      const result = await login(cedula, password);

      if (!result.success) {
        setMensaje(result.message || "Error al iniciar sesión");
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Login exitoso!",
        text: "Bienvenido al sistema",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/");
      });

    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error inesperado. Por favor intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu usuario y contraseña para iniciar sesión.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Usuario (Cédula) <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Ingresa tu cédula"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => !isLoading && setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  {mensaje && (
                    <p className="text-center text-sm text-warning-700 mb-2">
                      {mensaje}
                    </p>
                  )}

                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}