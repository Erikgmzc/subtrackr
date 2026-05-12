import { login } from "../actions";

export default function LoginPage() {
  return (
    // Fondo gris claro para que resalte la tarjeta
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      
      {/* Tarjeta del formulario: Blanca, con sombra y borde */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600">SubTrackr</h1>
          <p className="text-slate-500 mt-2">Controla tus gastos, recupera tu dinero</p>
        </div>

        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800" 
              placeholder="nombre@ejemplo.com" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            formAction={login}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            Entrar / Crear cuenta
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Al continuar, aceptas nuestros términos y condiciones.
        </p>
      </div>
    </div>
  );
}