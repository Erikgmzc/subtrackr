'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import {redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase';

export async function deleteSubscription(id: string) {
    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)

        if (!error) {
            revalidatePath('/') // Esto limpia la caché y actualiza la lista
        }
}

export async function login(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        const {error: signUpError} = await supabase.auth.signUp({ email, password });
        if (signUpError)  return redirect('/login?error=auth-failed')

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
