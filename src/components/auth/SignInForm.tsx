import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import ToastModal from "../ToastModal";
import Swal from "sweetalert2";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!cedula || !password) {
      setMensaje("Por favor ingresa los campos");
      return;
    }

    try {

      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({ cedula, password })
        // "Authorization" : `Bearer ${token}`,
      });

      const data = await response.json();

      // Primero valida si está bien
      if (!response.ok || !data.token) {
        const backendMessage = data.mensaje || data.message || "Error al iniciar sesión";
        setMensaje(backendMessage);
        return;
      }

      sessionStorage.setItem("token", data.token);

      sessionStorage.setItem("user", JSON.stringify({

        cedula: data.user.cedula,
        name: `${data.user.nombres} ${data.user.apellidos}`
      }))



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
      console.error("Error", error)
    }

  };

  return (

    <div className="flex flex-col flex-1">

      <ToastModal
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />


      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu correo electrónico y contraseña para iniciar sesión.
            </p>
          </div>
          <div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Usuario <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input placeholder="Ingresa tu usuario"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
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
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
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
                    <p className={`text-center text-sm  text-warning-700 }`}>
                      {mensaje}
                    </p>
                  )}

                  <Button className="w-full" size="sm">
                    Iniciar Sesión
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
