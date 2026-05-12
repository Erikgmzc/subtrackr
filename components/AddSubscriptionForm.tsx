'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, X } from 'lucide-react';

export default function AddSubscriptionForm() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

async function handleSubmit(formData: FormData) {
        const name = formData.get('name')
        const price = formData.get('price')
        const category = formData.get('category')
        const next_billing_date = formData.get('date')

        // 1. Obtenemos el usuario actual
        const { data: { user } } = await supabase.auth.getUser();

        // 2. Si no hay usuario, no permitimos guardar (medida de seguridad extra)
        if (!user) {
            console.error("No hay usuario autenticado");
            return;
        }

        // 3. Hacemos UNA SOLA inserción vinculando el user_id
        const { error } = await supabase
            .from('subscriptions')
            .insert([
                {
                    name,
                    price: parseFloat(price as string),
                    category,
                    next_billing_date,
                    user_id: user.id // <-- Vital para que el RLS te permita verlo luego
                }
            ])

        // 4. Si todo ha ido bien, cerramos y refrescamos
        if (!error) {
            setIsOpen(false);
            router.refresh();
        } else {
            console.error("Error al guardar:", error.message);
            alert("Error al guardar la suscripción");
        }
    }

   return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Nueva Suscripción</h2>
        <button onClick={() => setIsOpen(false)}><X size={20}/></button>
      </div>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre</label>
          <input name="name" type="text" required className="w-full border p-2 rounded-md" placeholder="Ej: Netflix" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Precio</label>
            <input name="price" type="number" step="0.01" required className="w-full border p-2 rounded-md" placeholder="9.99" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Fecha de Cobro</label>
            <input name="date" type="date" required className="w-full border p-2 rounded-md" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Categoría</label>
          <select name="category" className="w-full border p-2 rounded-md">
            <option value="streaming">Streaming</option>
            <option value="gym">Gimnasio</option>
            <option value="software">Software / SaaS</option>
            <option value="otros">Otros</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md font-semibold">Guardar</button>
      </form>
    </div>
  )
}