'use client';

import { createBrowserClient } from "@supabase/ssr"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LogoutButton (){

    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login')
        router.refresh();

    };

    return (
        <button onClick={handleLogout}
        className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold text-sm transtion-colors">
            <LogOut size={18}/>
            Cerrar Sesion
        </button>
    );


}
