
import { tools } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sparkles, Zap, Star } from "lucide-react";

export function AllTools() {
  return (
    <section id="more-tools" className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* AI-Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-1 h-1 bg-blue-500/40 rounded-full animate-ping" />
      <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-500/30 rounded-full animate-bounce" />

      <div className="relative container px-4 md:px-6 mx-auto">
        <header className="text-center mb-12 md:mb-16">
          {/* AI Badge */}
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20 text-primary font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Toolkit
            </Badge>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-blue-600 bg-clip-text text-transparent">
              Explore More Tools
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive suite of 
            <span className="text-primary font-medium"> AI-enhanced tools</span> designed to 
            streamline your workflow and boost productivity.
          </p>

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-blue-500" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI-Enhanced</span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool, index) => (
            <Link href={tool.href} key={tool.title} className="group">
              <Card className="relative h-full overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 cursor-pointer group-hover:scale-[1.02]">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                <CardHeader className="relative flex flex-row items-center gap-4 p-6">
                  {/* Enhanced Icon Container */}
                  <div className="relative flex-shrink-0">
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-xl border border-white/10 group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/20">
                      <tool.icon 
                        className="h-7 w-7 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
                        style={{ color: tool.color || '#3b82f6' }} 
                      />
                    </div>
                    
                    {/* Sparkle Effect */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </CardDescription>
                    
                    {/* AI Badge for AI tools */}
                    {tool.category === 'ai' && (
                      <Badge variant="secondary" className="mt-3 px-2 py-1 text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-600">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>

                  {/* Arrow Indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for?
          </p>
          <Badge variant="outline" className="px-4 py-2 border-primary/30 text-primary hover:bg-primary/10 transition-colors cursor-pointer">
            <Sparkles className="w-4 h-4 mr-2" />
            More tools coming soon
          </Badge>
        </div>
      </div>
    </section>
  )
}
