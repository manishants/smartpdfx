
'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getProfile() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: 'User not found.' };
  }

  const { data, error, status } = await supabase
    .from('profiles')
    .select(`username, full_name, website, avatar_url`)
    .eq('id', user.id)
    .single();

  if (error && status !== 406) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateProfile(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const fullName = formData.get('fullName') as string;
  const username = formData.get('username') as string;
  const website = formData.get('website') as string;

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    username,
    website,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (error) {
    console.error('Error updating profile:', error);
    return { error: error.message };
  }
  
  revalidatePath('/admin/profile');
  return { error: null };
}
