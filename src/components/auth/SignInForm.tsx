import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import {  toast } from "react-toastify";
import ToastModal from "../ToastModal";



export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const [toast, setToast] = useState({show:false, message:"", type:"success"})

  const showToast = (message, type = "success") => {
    setToast({show:  true, message, type})
  }



  const handleSubmit  = async (e) => {
    e.preventDefault();

      setMensaje("");


    if(!cedula || !password){
        setMensaje("Por favor ingresa los campos");
        return;
    }


    try {

      // const token = sessionStorage.getItem("token");
          const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
              "Content-Type":"application/json",
              
            },
            body: JSON.stringify({cedula, password})
            // "Authorization" : `Bearer ${token}`,
          });

          const data = await response.json();
          console.log("v", data)
          
            sessionStorage.setItem("token", data.token);
          console.log("token", sessionStorage.getItem("token"))

          sessionStorage.setItem("user", JSON.stringify({
            
            cedula: data.cedula,
            name: data.nombres
          }))
          
          

          if(!response.ok){
              const backendMessage = data.mensaje || data.message || "Error al iniciar sesión";
              setMensaje(backendMessage);
              return;

          }

        

          // const successMessage = data.mensaje || data.message || "Inicio sesion exitoso";
          // setMensaje(successMessage)

            // toast.success("Login Exitoso",{
            //   position: "top-center",
            //   autoClose: 1200

            // })

            showToast("Login Exitoso")
          console.log("Usuario Identificado", data)

          setTimeout(() => {
              navigate("/");
          },1000)

          

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

        {/* <ToastContainer 
              position="top-center" 
              autoClose={2000} 
              hideProgressBar={true}
              closeOnClick
            pauseOnHover
            draggable={false}

    theme="colored"

    toastStyle={{
      width: "650px",
      maxWidth: "90%",

      backgroundColor: "#333",
      color: "#fff",

      borderRadius: "16px",
      padding: "25px 30px",
      fontSize: "18px",

      textAlign: "center",
      boxShadow: "0px 10px 40px rgba(0,0,0,0.3)",
    }}
    style={{
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
    }}
              
  /> */}
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
                    onChange={(e)=>setCedula(e.target.value)}
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
                      onChange={(e)=> setPassword(e.target.value)}
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
