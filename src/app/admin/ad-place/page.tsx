"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
export default function AdPlacePage() {
    const [adCode, setAdCode] = useState(`<ins
    className="adsbygoogle"
    style={{ display: 'block', width: '100%', height: '100%' }}
    data-ad-client="ca-pub-YOUR_CLIENT_ID" 
    data-ad-slot="YOUR_AD_SLOT_ID"       
    data-ad-format="auto"
    data-full-width-responsive="true"
></ins>`);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const handleSave = async () => {
        setIsLoading(true);
        // In a real app, you would save this to a database or a configuration file.
        // For this demo, we'll just simulate a save.
        console.log("Saving new ad code:", adCode);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
            title: "Ad Code Saved",
            description: "The Google Ad code has been updated.",
        });
        setIsLoading(false);
    };
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Ad Placements</CardTitle>
                    <CardDescription>Update the Google AdSense code for your website. The changes will apply to all ad units.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="adCode">Google AdSense Code</Label>
                        <Textarea
                            id="adCode"
                            value={adCode}
                            onChange={(e) => setAdCode(e.target.value)}
                            rows={10}
                            className="font-mono text-sm"
                            placeholder="Paste your ad code here..."
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isLoading}>
                         {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Ad Code</>}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
