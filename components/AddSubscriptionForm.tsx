'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, X, Check, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';
import { format } from 'date-fns';

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

  // Guardamos la fecha seleccionada en estado (por defecto, hoy)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(formData: FormData) {
    const name = isCustom ? formData.get('name') : selectedPreset?.name;
    const category = isCustom ? formData.get('category') : selectedPreset?.category;
    const price = formData.get('price');
    const currency = formData.get('currency');

    // 🚨 Ahora leemos la fecha del input oculto (que DatePicker no puede pasar directamente)
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
        currency: String(currency),
        category: String(category).toLowerCase(),
        next_billing_date,
        user_id: userId,
      }]);

    if (error) {
      toast.error("Error al guardar: " + error.message, { id: toastId });
    } else {
      toast.success(`¡${name} añadido correctamente!`, { id: toastId });
      setIsOpen(false);
      setSelectedPreset(null);
      setIsCustom(false);
      setSelectedDate(new Date());
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-lg shadow-blue-200 dark:shadow-none font-bold active:scale-95"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform" />
        Añadir Nueva Suscripción
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl relative z-10 overflow-visible"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Añadir Servicio</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Configura los detalles de tu suscripción</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); setSelectedPreset(null); setIsCustom(false); }}
                  className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form action={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESETS.map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => { setSelectedPreset(app); setIsCustom(false); }}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 font-bold text-xs
                        ${selectedPreset?.name === app.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-md'
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'}`}
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
                      ${isCustom
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Plus size={20} />
                    </div>
                    Otros
                  </button>
                </div>

                {isCustom && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">Nombre</label>
                      <input name="name" type="text" required className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Gimnasio" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">Categoría</label>
                      <select name="category" className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none">
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
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">Precio Mensual y Moneda</label>
                      <div className="flex gap-2">
                        <input name="price" type="number" step="0.01" required className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg" placeholder="0.00" />
                        <select name="currency" className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                          <option value="EUR">€ EUR</option>
                          <option value="USD">$ USD</option>
                          <option value="GBP">£ GBP</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative flex flex-col">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">Próximo cobro</label>

                      {/* 🚨 INPUT OCULTO: Esto es lo que realmente se envía al backend */}
                      <input
                        type="hidden"
                        name="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                      />

                      <div className="relative w-full">
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => {
                            if (date) setSelectedDate(date);
                          }}
                          locale={es}
                          dateFormat="d 'de' MMMM, yyyy"

                          // --- NAVEGACIÓN PRO ---
                          showMonthDropdown      // Permite elegir mes en lista
                          showYearDropdown       // Permite elegir año en lista
                          dropdownMode="select"    // Convierte los dropdowns en selectores modernos
                          yearDropdownItemNumber={15} // Cuántos años mostrar en la lista
                          scrollableYearDropdown  // Permite hacer scroll en los años

                          wrapperClassName="w-full"
                          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm cursor-pointer"
                        />
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                    </div>

                    <button type="submit" className="md:col-span-2 w-full bg-slate-900 dark:bg-blue-600 text-white p-5 rounded-2xl font-black text-xl hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl active:scale-95 mt-4">
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