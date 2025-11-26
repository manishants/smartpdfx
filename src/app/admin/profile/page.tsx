
"use client";

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { getProfile, updateProfile } from '@/app/actions/profile';
import { createClient } from '@/lib/supabase/client';

type Profile = {
    username: string | null;
    full_name: string | null;
    website: string | null;
    avatar_url: string | null;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        setUser(user);
        const { data, error } = await getProfile();
        if (error) {
            toast({ title: "Error loading profile", description: "Please ensure you have created the 'profiles' table in Supabase.", variant: "destructive" });
        }
        setProfile(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);
  
  async function handleUpdateProfile(formData: FormData) {
    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);

    if (result.error) {
      toast({ title: "Error updating profile", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully!" });
      // Re-fetch profile to show updated data
      fetchUserProfile();
    }
  }

  const handleInputChange = (field: keyof Profile, value: string) => {
      if (profile) {
          setProfile({...profile, [field]: value});
      }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card>
        <form action={handleUpdateProfile}>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your account details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={profile?.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={profile?.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={profile?.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
