'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion'; 

const PRESETS = [
  { name: 'Netflix', category: 'streaming', color: 'bg-red-600' },
  { name: 'Spotify', category: 'streaming', color: 'bg-[#1DB954]' },
  { name: 'Amazon Prime', category: 'streaming', color: 'bg-[#00A8E1]' },
  { name: 'YouTube Premium', category: 'streaming', color: 'bg-[#FF0000]' },
  { name: 'Xbox Game Pass', category: 'software', color: 'bg-[#107C10]' },
  { name: 'PlayStation Plus', category: 'software', color: 'bg-[#003791]' },
  { name: 'Disney+', category: 'streaming', color: 'bg-[#006E99]' },
];

export default function AddSubscriptionForm({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESETS[0] | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(formData: FormData) {
    const name = isCustom ? formData.get('name') : selectedPreset?.name;
    const category = isCustom ? formData.get('category') : selectedPreset?.category;
    const price = formData.get('price');
    const next_billing_date = formData.get('date');

    if (!name || !price || !category || !next_billing_date) {
      toast.error("Por favor, rellena todos los campos");
      return;
    }

    const toastId = toast.loading("Guardando suscripción...");

    const { error } = await supabase
      .from('subscriptions')
      .insert([{
        name: String(name),
        price: parseFloat(price as string),
        category: String(category).toLowerCase(),
        next_billing_date,
        user_id: userId, 
      }]);

    if (error) {
      toast.error("Error al guardar: " + error.message, { id: toastId});
    } else {
      toast.success(`¡${name} añadido correctamente!`, { id: toastId});
      setIsOpen(false); // Cerramos el modal
      setSelectedPreset(null);
      setIsCustom(false);
      router.refresh();
    }
  }

  return (
    <>
      {/* 1. BOTÓN DISPARADOR (Siempre visible) */}
      <button
        onClick={() => setIsOpen(true)}
        className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-lg shadow-blue-200 font-bold active:scale-95"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform" /> 
        Añadir Nueva Suscripción
      </button>

      {/* 2. MODAL CON ANIMACIONES */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Fondo oscuro con desenfoque */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)} // Cierra al hacer clic fuera
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Contenedor del Formulario */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] scrollbar-hide"
            >
              {/* Header del Modal */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Añadir Servicio</h2>
                  <p className="text-slate-500 font-medium text-sm">Configura los detalles de tu suscripción</p>
                </div>
                <button 
                  onClick={() => { setIsOpen(false); setSelectedPreset(null); setIsCustom(false); }}
                  className="bg-slate-100 p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X size={24}/>
                </button>
              </div>

              {/* Formulario */}
              <form action={handleSubmit} className="space-y-8">
                {/* Selector de Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESETS.map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => { setSelectedPreset(app); setIsCustom(false); }}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 font-bold text-xs
                        ${selectedPreset?.name === app.name 
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${app.color} flex items-center justify-center text-white shadow-inner font-black text-lg`}>
                        {app.name[0]}
                      </div>
                      {app.name}
                      {selectedPreset?.name === app.name && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => { setIsCustom(true); setSelectedPreset(null); }}
                    className={`p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 font-bold text-xs
                      ${isCustom ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Plus size={20} />
                    </div>
                    Otros
                  </button>
                </div>

                {/* Campos dinámicos */}
                {isCustom && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">Nombre</label>
                      <input name="name" type="text" required className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Gimnasio" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">Categoría</label>
                      <select name="category" className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="streaming">Streaming</option>
                        <option value="gym">Gimnasio</option>
                        <option value="software">Software / SaaS</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>
                  </div>
                )}

                {(selectedPreset || isCustom) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">Precio Mensual</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">€</span>
                        <input name="price" type="number" step="0.01" required className="w-full bg-slate-50 border-none p-4 pl-10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">Próximo cobro</label>
                      <input name="date" type="date" required className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" />
                    </div>
                    <button type="submit" className="md:col-span-2 w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl active:scale-95">
                      Confirmar Registro
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}