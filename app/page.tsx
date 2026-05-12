import { CreditCard, Plus, Trash2 } from 'lucide-react';
import AddSubscriptionForm from '@/components/AddSubscriptionForm';
import { deleteSubscription } from './actions';
import { createClient } from '@/utils/supabase';
import { redirect } from 'next/navigation';

// --- 1. FUNCIÓN DE APOYO (Fuera del componente para orden) ---
const getCategoryStyle = (category: string) => {
  const styles: Record<string, string> = {
    streaming: "bg-red-50 text-red-600 border-red-100",
    gym: "bg-green-50 text-green-600 border-green-100",
    software: "bg-purple-50 text-purple-600 border-purple-100",
    otros: "bg-slate-50 text-slate-600 border-slate-100",
  };
  return styles[category?.toLowerCase()] || styles.otros;
};

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Petición de datos
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*');

  if (error) return <p className="p-8 text-red-500">Error cargando suscripciones.</p>;

  // Cálculos
  const totalMensual = subscriptions?.reduce((acc, sub) => acc + Number(sub.price), 0) || 0;
  const totalAnual = totalMensual * 12;
  const subMasCara = subscriptions?.length 
    ? [...subscriptions].sort((a, b) => b.price - a.price)[0] 
    : null;

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mis Suscripciones</h1>
            <p className="text-slate-500 font-medium">Gestiona tus gastos mensuales de forma inteligente</p>
          </div>
        </header>

        {/* Estadísticas Rápidas */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-100">
            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Gasto Mensual</p>
            <h2 className="text-4xl font-black mt-1">{totalMensual.toFixed(2)} €</h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Proyección Anual</p>
            <h2 className="text-3xl font-bold mt-1 text-slate-800">{totalAnual.toFixed(2)} €</h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Top Gasto</p>
            <h2 className="text-xl font-bold mt-1 text-slate-800 truncate">
              {subMasCara ? subMasCara.name : "N/A"}
            </h2>
            {subMasCara && <p className="text-sm font-bold text-red-500">{subMasCara.price} €/mes</p>}
          </div>
        </section>

        <AddSubscriptionForm userId ={user.id} />

        {/* --- 2. LISTA CON ESTILOS DINÁMICOS Y ESTADO VACÍO --- */}
        <div className="grid gap-4 mt-8">
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((sub) => {
              const categoryStyle = getCategoryStyle(sub.category);
              
              return (
                <div 
                  key={sub.id} 
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md hover:border-blue-100 transition-all duration-300"
                >
                  {/* Izquierda: Icono dinámico */}
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${categoryStyle.split(' ')[0]} ${categoryStyle.split(' ')[1]}`}>
                      <CreditCard size={26} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">{sub.name}</h3>
                      <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border mt-1.5 inline-block ${categoryStyle}`}>
                        {sub.category}
                      </span>
                    </div>
                  </div>

                  {/* Derecha: Precio y Acciones */}
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900">
                        {sub.price}<span className="text-sm ml-0.5 font-medium text-slate-400">€</span>
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                        Cobro: {new Date(sub.next_billing_date).toLocaleDateString()}
                      </p>
                    </div>

                    <form action={deleteSubscription.bind(null, sub.id)}>
                      <button className="text-slate-200 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={22} />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          ) : (
            /* ESTADO VACÍO CUANDO NO HAY DATOS */
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="text-slate-300" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Tu lista está vacía</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-3 text-lg font-medium">
                No hemos encontrado suscripciones activas. ¡Añade la primera para empezar!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}