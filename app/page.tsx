import { CreditCard } from 'lucide-react';
import AddSubscriptionForm from '@/components/AddSubscriptionForm';
import { createClient } from '@/utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import ExpensesChart from '@/components/ExpensesChart';
import LogoutButton from '@/components/LogoutButton';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// --- 1. FUNCIONES DE APOYO ---
const getCategoryStyle = (category: string) => {
  const styles: Record<string, string> = {
    streaming: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
    gym: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
    software: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
    otros: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50",
  };
  return styles[category?.toLowerCase()] || styles.otros;
};

const getDaysUntil = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const billingDate = new Date(dateString);
  const diffTime = billingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default async function Dashboard(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const categoryFilter = searchParams.category;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let query = supabase.from('subscriptions').select('*').eq('user_id', user.id);
  if (categoryFilter && categoryFilter !== 'todas') {
    query = query.eq('category', categoryFilter);
  }
  query = query.order('next_billing_date', { ascending: true });

  const { data: subscriptions, error } = await query;

  const totalMensual = subscriptions?.reduce((acc, sub) => {
    const price = Number(sub.price);
    if(sub.currency === 'USD') return acc + (price * 0.92);
    if(sub.currency === 'GBP') return acc + (price * 1.17);
    return acc + price;
  }, 0) || 0;

  const totalAnual = totalMensual * 12;
  const subMasCara = subscriptions?.length
    ? [...subscriptions].sort((a, b) => b.price - a.price)[0]
    : null;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">

        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Mis Suscripciones</h1>
            <div className="flex items-center gap-4">
              <LogoutButton />
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Dashboard inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <ThemeSwitcher />
            <AddSubscriptionForm userId={user.id} />
          </div>
        </header>

        {/* --- Estadísticas Rápidas --- */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="lg:col-span-2 bg-slate-900 dark:bg-blue-900/20 text-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group border border-transparent dark:border-blue-800/30">
            <div className="relative z-10">
              <p className="text-slate-400 dark:text-blue-300 text-xs font-bold uppercase tracking-widest">Gasto Mensual</p>
              <h2 className="text-5xl font-black mt-2">{totalMensual.toFixed(2)} €</h2>
            </div>
            <CreditCard className="absolute -right-6 -bottom-6 text-white opacity-10 group-hover:rotate-12 transition-transform duration-500" size={160}/>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Proyección Anual</p>
            <h2 className="text-3xl font-black mt-2 text-slate-800 dark:text-slate-100">{totalAnual.toFixed(2)} €</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
              Top: <span className="font-bold text-slate-700 dark:text-slate-200">{subMasCara ? subMasCara.name : "N/A"}</span>
            </p>
          </div>

          {/* 🚨 CORRECCIÓN DEL GRÁFICO: min-h-[300px] para que tenga altura */}
          <div className="min-h-[300px] lg:col-span-1">
             <ExpensesChart subscriptions={subscriptions || []} />
          </div>

        </section>

        {/* --- Filtros Rápidos --- */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['todas', 'streaming', 'gym', 'software', 'otros'].map((cat) => {
            const isActive = categoryFilter === cat || (!categoryFilter && cat === 'todas');
            return (
              <Link
                key={cat}
                href={cat === 'todas' ? '/' : `/?category=${cat}`}
                scroll={false} 
                className={`px-5 py-2.5 rounded-full text-xs font-black capitalize transition-all border ${isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none scale-105"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* --- LISTA Y ESTADO VACÍO --- */}
        <div className="mt-8">
          {!subscriptions || subscriptions.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 border-dashed mb-12 animate-in fade-in zoom-in duration-500">
              <div className="text-6xl mb-4">👻</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Todo muy tranquilo por aquí</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
                Aún no tienes ninguna suscripción registrada. Haz clic en el botón de arriba para empezar a tener el control de tu dinero.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {subscriptions.map((sub) => {
                const categoryStyle = getCategoryStyle(sub.category);
                const daysLeft = getDaysUntil(sub.next_billing_date);
                const isUrgent = daysLeft >= 0 && daysLeft <= 3;

                return (
                  <div
                    key={sub.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:shadow-md dark:hover:border-blue-900/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${categoryStyle.split(' ')[0]} ${categoryStyle.split(' ')[1]}`}>
                        <CreditCard size={26} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 leading-tight">{sub.name}</h3>
                        <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full border mt-2 inline-block ${categoryStyle}`}>
                          {sub.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{sub.price} {sub.currency || '€'}</p>
                        <div className="mt-1">
                          {daysLeft < 0 ? (
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-full uppercase">Cobrado</span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${isUrgent ? "bg-orange-100 text-orange-600 animate-pulse" : "bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                              {daysLeft === 0 ? "Hoy" : `En ${daysLeft} días`}
                            </span>
                          )}
                        </div>
                      </div>

                      <DeleteButton id={sub.id} name={sub.name} />
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