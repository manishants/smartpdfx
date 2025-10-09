
import { tools } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export function AllTools() {
  return (
    <section id="more-tools" className="w-full py-12 md:py-16 lg:py-20 bg-muted">
      <div className="container px-4 md:px-6">
        <header className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline">Explore More Tools</h2>
          <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Discover our full suite of free online tools to make your life easier.
          </p>
        </header>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <Link href={tool.href} key={tool.title} className="group">
              <Card
                className="h-full hover:shadow-lg hover:-translate-y-1 transition-transform cursor-pointer bg-card/50 hover:bg-card"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold">{tool.title}</CardTitle>
                    <CardDescription className="mt-1 text-xs">{tool.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
