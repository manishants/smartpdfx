'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export const BottomAdsSection = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <section className="w-full py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-background via-accent/5 to-primary/5 border-t border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                    <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20">
                            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
                        </div>
                        <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
                            <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Sponsored Content
                        </Badge>
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-2 sm:mb-3">
                        Discover Amazing Tools & Services
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                        Explore curated recommendations and premium solutions to enhance your productivity
                    </p>
                </div>

                {/* Ads Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                    {/* Primary Ad Unit */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-2 p-4 sm:p-6 bg-gradient-to-br from-card/50 to-card border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Featured</span>
                        </div>
                        <ins
                            className="adsbygoogle block w-full"
                            style={{ display: 'block', minHeight: '200px' }}
                            data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                            data-ad-slot="YOUR_AD_SLOT_ID_1"
                            data-ad-format="auto"
                            data-full-width-responsive="true"
                        />
                    </Card>

                    {/* Secondary Ad Unit */}
                    <Card className="col-span-1 p-4 sm:p-6 bg-gradient-to-br from-card/50 to-card border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
                            <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Recommended</span>
                        </div>
                        <ins
                            className="adsbygoogle block w-full"
                            style={{ display: 'block', minHeight: '200px' }}
                            data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                            data-ad-slot="YOUR_AD_SLOT_ID_2"
                            data-ad-format="auto"
                            data-full-width-responsive="true"
                        />
                    </Card>
                </div>

                {/* Bottom Banner Ad */}
                <Card className="w-full p-4 sm:p-6 bg-gradient-to-r from-card/30 via-card/50 to-card/30 border border-border/50 hover:border-primary/20 transition-all duration-300">
                    <div className="text-center mb-3 sm:mb-4">
                        <Badge variant="outline" className="px-3 py-1 text-xs font-medium border-primary/30 text-primary">
                            Premium Partners
                        </Badge>
                    </div>
                    <ins
                        className="adsbygoogle block w-full"
                        style={{ display: 'block', minHeight: '120px' }}
                        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                        data-ad-slot="YOUR_AD_SLOT_ID_3"
                        data-ad-format="horizontal"
                        data-full-width-responsive="true"
                    />
                </Card>

                {/* Disclaimer */}
                <div className="text-center mt-6 sm:mt-8">
                    <p className="text-xs sm:text-sm text-muted-foreground/70">
                        Advertisements help us provide free tools and services. 
                        <span className="ml-1 text-primary hover:underline cursor-pointer">Learn more</span>
                    </p>
                </div>
            </div>
        </section>
    );
};