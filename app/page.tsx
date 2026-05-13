import { CreditCard, Trash2 } from 'lucide-react';
import AddSubscriptionForm from '@/components/AddSubscriptionForm';
import { deleteSubscription } from './actions';
import { createClient } from '@/utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// --- 1. FUNCIONES DE APOYO ---
const getCategoryStyle = (category: string) => {
  const styles: Record<string, string> = {
    streaming: "bg-red-50 text-red-600 border-red-100",
    gym: "bg-green-50 text-green-600 border-green-100",
    software: "bg-purple-50 text-purple-600 border-purple-100",
    otros: "bg-slate-50 text-slate-600 border-slate-100",
  };
  return styles[category?.toLowerCase()] || styles.otros;
};

const getDaysUntil = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a medianoche para que el cálculo de "Hoy" sea exacto
  const billingDate = new Date(dateString);
  const diffTime = billingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default async function Dashboard({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = await createClient();
  const categoryFilter = searchParams.category;

  // 1. Verificación de usuario
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Búsqueda y Filtrado (Seguro con user_id)
  let query = supabase.from('subscriptions').select('*').eq('user_id', user.id);

  if (categoryFilter && categoryFilter !== 'todas') {
    query = query.eq('category', categoryFilter);
  }

  // Ordenar por fecha más próxima por defecto
  query = query.order('next_billing_date', { ascending: true });

  const { data: subscriptions, error } = await query;

  if (error) {
    console.error("Error al cargar datos:", error);
  }

  // 3. Cálculos
  const totalMensual = subscriptions?.reduce((acc, sub) => acc + Number(sub.price), 0) || 0;
  const totalAnual = totalMensual * 12;
  const subMasCara = subscriptions?.length
    ? [...subscriptions].sort((a, b) => b.price - a.price)[0]
    : null;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">

        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mis Suscripciones</h1>
            <p className="text-slate-500 font-medium mt-1">Gestiona tus gastos mensuales de forma inteligente</p>
          </div>
          <AddSubscriptionForm userId={user.id} />
        </header>

        {/* --- Estadísticas Rápidas --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Gasto Mensual</p>
              <h2 className="text-4xl font-black mt-2">{totalMensual.toFixed(2)} €</h2>
            </div>
            <CreditCard className="absolute -right-6 -bottom-6 text-white opacity-10 group-hover:rotate-12 transition-transform duration-500" size={140} />
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Proyección Anual</p>
            <h2 className="text-3xl font-black mt-2 text-slate-800">{totalAnual.toFixed(2)} €</h2>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Top Gasto</p>
            <h2 className="text-2xl font-bold mt-2 text-slate-800 truncate">
              {subMasCara ? subMasCara.name : "N/A"}
            </h2>
            {subMasCara && <p className="text-sm font-bold text-red-500 mt-1">{subMasCara.price} €/mes</p>}
          </div>
        </section>

        {/* --- Filtros Rápidos --- */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['todas', 'streaming', 'gym', 'software', 'otros'].map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <Link
                key={cat}
                href={cat === 'todas' ? '/' : `/?category=${cat}`}
                scroll={false} // Evita que la página salte arriba al filtrar
                className={`px-5 py-2.5 rounded-full text-xs font-black capitalize transition-all border ${isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* --- LISTA Y ESTADO VACÍO (EL FANTASMA 👻) --- */}
        <div className="mt-8">
          {!subscriptions || subscriptions.length === 0 ? (
            /* ESTADO VACÍO */
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-200 border-dashed mb-12 animate-in fade-in zoom-in duration-500">
              <div className="text-6xl mb-4">👻</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Todo muy tranquilo por aquí</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                Aún no tienes ninguna suscripción registrada. Haz clic en el botón de arriba para empezar a tener el control de tu dinero.
              </p>
            </div>
          ) : (
            /* LISTA DE TARJETAS */
            <div className="grid gap-4">
              {subscriptions.map((sub) => {
                const categoryStyle = getCategoryStyle(sub.category);
                const daysLeft = getDaysUntil(sub.next_billing_date);
                const isUrgent = daysLeft >= 0 && daysLeft <= 3;

                return (
                  <div
                    key={sub.id}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:shadow-md hover:border-blue-100 transition-all duration-300"
                  >
                    {/* Izquierda: Icono y Nombre */}
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${categoryStyle.split(' ')[0]} ${categoryStyle.split(' ')[1]}`}>
                        <CreditCard size={26} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 leading-tight">{sub.name}</h3>
                        <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full border mt-2 inline-block ${categoryStyle}`}>
                          {sub.category}
                        </span>
                      </div>
                    </div>

                    {/* Derecha: Precio, Alerta y Borrar */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">{sub.price} €</p>
                        <div className="mt-1">
                          {daysLeft < 0 ? (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase">
                              Cobrado
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${isUrgent ? "bg-orange-100 text-orange-600 animate-pulse" : "bg-blue-50 text-blue-500"
                              }`}>
                              {daysLeft === 0 ? "Hoy" : `En ${daysLeft} días`}
                            </span>
                          )}
                        </div>
                      </div>

                      <form action={deleteSubscription.bind(null, sub.id)} 
                      onSubmit={(e) => {
                        if (!confirm(`¿Seguro que quieres eliminar ${sub.name}?`)) {
                          e.preventDefault();
                        }
                      }}
                      >
                        <button className="text-slate-200 hover:text-red-500 hover:bg-red-50 p-4 rounded-2xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100">
                          <Trash2 size={24} />
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}