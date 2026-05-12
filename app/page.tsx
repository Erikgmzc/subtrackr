import { supabase } from '@/lib/supabase';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import AddSubscriptionForm from '@/components/AddSubscriptionForm';
import { deleteSubscription } from './actions';
import { createClient } from '@/utils/supabase';
import { redirect } from 'next/navigation';


export default async function Dashboard() {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login')
  }




  // 1. Petición de datos directamente en el servidor
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*');

  if (error) return <p>Error cargando suscripciones.</p>;

  const totalMensual = subscriptions?.reduce((acc, sub) => acc + Number(sub.price), 0) || 0;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mis Suscripciones</h1>
            <p className="text-slate-500">Gestiona tus gastos mensuales</p>
          </div>

        </header>
        {/* Estadísticas Rápidas */}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <p className="text-blue-100 text-sm font-medium">Gasto Total Mensual</p>
            <h2 className="text-4xl font-bold mt-1">{totalMensual.toFixed(2)} €</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Suscripciones Activas</p>
            <h2 className="text-4xl font-bold mt-1 text-slate-800">{subscriptions?.length || 0}</h2>
          </div>
        </section>

        <AddSubscriptionForm />

        {/* Lista de Suscripciones */}
        <div className="grid gap-4">
          {subscriptions?.map((sub) => (
            <div key={sub.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center group">
              {/* Izquierda: Icono y Nombre */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{sub.name}</h3>
                  <p className="text-sm text-slate-500 uppercase">{sub.category}</p>
                </div>
              </div>

              {/* Derecha: Precio, Fecha y Papelera */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">
                    {sub.price} {sub.currency}
                  </p>
                  <p className="text-xs text-slate-400">Cobro: {sub.next_billing_date}</p>
                </div>

                {/* El botón de borrar ahora con color más visible y hover */}
                <form action={deleteSubscription.bind(null, sub.id)}>
                  <button className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-50 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </form>
              </div>
            </div>
          ))}

          {subscriptions?.length === 0 && (
            <p className="text-center py-12 text-slate-500">No hay suscripciones todavía. ¡Añade la primera!</p>
          )}
        </div>
      </div>
    </main>
  );
}