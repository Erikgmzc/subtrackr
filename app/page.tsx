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


const getDaysUntil = (dateString: string) => {

  const today = new Date();
  const billingDate = new Date(dateString);
  const diffTime = billingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;

};


export default async function Dashboard({ searchParams, }: { searchParams: { category?: string};}) {

  const supabase = await createClient();
  const categoryFilter = searchParams.category;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  //Buscador,Filtrador de subscripciones actualizado 

  let query = supabase.from('subscriptions').select('*');

    if (categoryFilter && categoryFilter !== 'todas') {
      query = query.eq('category' , categoryFilter);

    }
    const { data: subscriptions, error } = await query;

  // Petición de datos
  /*const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*');

  if (error) return <p className="p-8 text-red-500">Error cargando suscripciones.</p>;
*/
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
        

        <div className='flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide'>
        {['todas' , 'streaming' , 'gym' , 'software' , 'otros'].map((cat) => (

          <a 
          key={cat}
          href={cat === 'todas' ? '/' : `?category=${cat}`}
          className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${(categoryFilter === cat || (!categoryFilter && cat === 'todas'))
            ? "bg-slate-900 text-white shadow-md"
            : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
          }`}
          >
            {cat}
          </a>

        ))}
        </div>

        <AddSubscriptionForm userId={user.id} />

        {/* --- 2. LISTA CON ESTILOS DINÁMICOS Y ESTADO VACÍO --- */}
        <div className="grid gap-4 mt-8">
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((sub) => {
              const categoryStyle = getCategoryStyle(sub.category);
              const daysLeft = getDaysUntil(sub.next_billing_date);
              const isUrgent = daysLeft >= 0 && daysLeft <= 3;

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
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">
                        {sub.price} €
                      </p>

                      {/* ETIQUETA DE DÍAS RESTANTES */}
                      <div className="mt-1">
                        {daysLeft < 0 ? (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase">
                            Cobrado
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${isUrgent
                              ? "bg-orange-100 text-orange-600 animate-pulse"
                              : "bg-blue-50 text-blue-500"
                            }`}>
                            {daysLeft === 0 ? "Hoy" : `En ${daysLeft} días`}
                          </span>
                        )}
                      </div>
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