'use client'

import { createBrowserClient } from "@supabase/ssr"

export default function SocialLogin(){

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const loginWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

};

return (
    <button onClick={loginWithGoogle} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 
    dark:border-slate-700 p-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm">
        <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google"/>
            Continuar Con Google
    </button>
);
}
