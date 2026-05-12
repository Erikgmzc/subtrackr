'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import {redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase';

export async function deleteSubscription(id: string) {
    // 1. IMPORTANTE: Usar el cliente que sabe leer las cookies de sesión
    const supabase = await createClient();

    console.log("Intentando borrar suscripción ID:", id);

    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

    if (error) {
        // Si hay un error de RLS, lo veremos aquí en el terminal
        console.error("Error al borrar en Supabase:", error.message);
        return;
    }

    // 2. Si no hay error, refrescamos la página
    console.log("Borrado con éxito");
    revalidatePath('/');
}

export async function login(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        const {error: signUpError} = await supabase.auth.signUp({ email, password });
       if (error) {
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
        // CAMBIA ESTA LÍNEA PARA VER EL ERROR REAL:
        return redirect(`/login?error=${encodeURIComponent(signUpError.message)}`);
    }
}

         }
         revalidatePath('/', 'layout')
         redirect('/')
    }


export async function SignOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout')
    redirect('/login')
}
