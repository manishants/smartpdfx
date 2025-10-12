
'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const CreateShortLinkSchema = z.object({
    originalUrl: z.string().url("Please enter a valid URL."),
    customSlug: z.string().max(50).regex(/^[a-zA-Z0-9_-]*$/, "Slug can only contain letters, numbers, hyphens, and underscores.").optional(),
});

function generateRandomSlug(length = 7) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createShortLink(formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to create a short link.' };
    }

    const validatedFields = CreateShortLinkSchema.safeParse({
        originalUrl: formData.get('originalUrl'),
        customSlug: formData.get('customSlug') || undefined,
    });

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return { error: firstError || "Invalid input." };
    }

    const { originalUrl, customSlug } = validatedFields.data;
    
    // Ensure custom slug, if provided, is not empty after trim
    const slugToUse = customSlug?.trim() || generateRandomSlug();
     if (!slugToUse) {
        return { error: 'Custom slug cannot be empty spaces.' };
    }

    // Check if slug already exists
    const { data: existingLink, error: fetchError } = await supabase
        .from('short_links')
        .select('slug')
        .eq('slug', slugToUse)
        .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = 'Not found'
        console.error("Error checking slug:", fetchError);
        return { error: "Database error. Could not verify slug." };
    }

    if (existingLink) {
        return { error: `The custom slug "${slugToUse}" is already taken. Please choose another.` };
    }

    // Insert new link
    const { data: newLink, error: insertError } = await supabase
        .from('short_links')
        .insert({ original_url: originalUrl, slug: slugToUse, user_id: user.id })
        .select()
        .single();
    
    if (insertError) {
        console.error("Error inserting link:", insertError);
        if (insertError.code === '42P01') {
             return { error: 'The "short_links" table does not exist. Please run the setup SQL in the Supabase editor.' };
        }
        return { error: "Failed to create short link in the database." };
    }
    revalidatePath(`/${newLink.slug}`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${cookies().get('host')?.value}`;
    const fullShortUrl = `${baseUrl}/${newLink.slug}`;

    return { success: 'Short link created successfully!', shortUrl: fullShortUrl };
}

export async function getOriginalUrl(slug: string): Promise<string | null> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('short_links')
        .select('original_url')
        .eq('slug', slug)
        .single();

    if (error || !data) {
        if (error && error.code !== 'PGRST116') {
            console.error(`Error fetching slug ${slug}:`, error);
        }
        return null;
    }

    return data.original_url;
}
