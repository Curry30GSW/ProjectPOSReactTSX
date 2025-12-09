import React, {useEffect} from "react";


export default function ToastModal({show, message, type="success", onClose}) {
    useEffect(() =>{
        if(show){
            const timer = setTimeout(() => {
                onClose()
            },1500)
            return () =>clearTimeout(timer);

        }
    }, [show])

    if(!show) return  null;

    return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* Fondo oscuro */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Caja */}
      <div
        className={`
          relative p-6 rounded-2xl shadow-xl text-center text-white animate-pop
          ${type === "success" ? "bg-green-600" : ""}
          ${type === "error" ? "bg-red-600" : ""}
          ${type === "info" ? "bg-blue-600" : ""}
        `}
      >
        <h2 className="text-xl font-semibold">{message}</h2>
      </div>

      {/* Animación */}
      <style>{`
        .animate-pop {
          animation: pop 0.25s ease-out;
        }

        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
)



}


