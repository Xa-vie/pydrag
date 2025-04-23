import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    SparklesIcon, 
    ArrowRightIcon, 
    KeyboardIcon, 
    MousePointerIcon, 
    TrashIcon, 
    CodeIcon,
    EyeIcon,
    LayoutTemplateIcon,
    UsersIcon,
    BrainCircuitIcon
} from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

const FEATURES = [
    {
        title: "Visual Programming",
        description: "Build Python applications using an intuitive drag-and-drop interface",
        icon: MousePointerIcon,
    },
    {
        title: "Keyboard Support",
        description: "Navigate and manipulate blocks efficiently using keyboard shortcuts",
        icon: KeyboardIcon,
    },
    {
        title: "Cursor Navigation",
        description: "Easily move blocks around your canvas using arrow keys for precise positioning",
        icon: ArrowRightIcon,
    },
    {
        title: "Block Deletion",
        description: "Quickly remove unwanted elements with dedicated delete functionality",
        icon: TrashIcon,
    },
    {
        title: "Real-time Preview",
        description: "See your changes instantly as you build your application",
        icon: EyeIcon,
    },
    {
        title: "Code Export",
        description: "Export your visual programs as clean, well-documented Python code",
        icon: CodeIcon,
    },
    {
        title: "Templates (Coming Soon)",
        description: "Start quickly with pre-built templates for common use cases",
        icon: LayoutTemplateIcon,
        upcoming: true,
    },
    {
        title: "Collaboration (Coming Soon)",
        description: "Work together with your team in real-time on shared projects",
        icon: UsersIcon,
        upcoming: true,
    },
    {
        title: "AI Assistance (Coming Soon)",
        description: "Get intelligent suggestions and code completion as you work",
        icon: BrainCircuitIcon,
        upcoming: true,
    },
];

export function FeaturesSection() {
    return (
        <section className="w-full py-32 bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24%,hsl(var(--muted))/10%_25%,transparent_26%)] bg-[length:12px_12px]" />
            </div>
            
            <div className="container px-4 md:px-6 relative">
                <div className="mx-auto max-w-4xl text-center mb-20">
                    <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-medium mb-6">
                        Powerful Features
                    </Badge>
                    
                    <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-6 text-foreground">
                        Why Choose PyDrag?
                    </h2>
                    
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Experience a revolutionary approach to Python development with features designed for both beginners and experts.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((feature, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative bg-background rounded-2xl p-8 border transition-all duration-300 overflow-hidden",
                                feature.upcoming 
                                    ? "border-dashed border-border/70" 
                                    : "border-border hover:shadow-lg"
                            )}
                        >
                            <div className={cn(
                                "absolute -inset-1 bg-gradient-to-br opacity-0 transition-opacity rounded-2xl blur-sm",
                                feature.upcoming 
                                    ? "from-blue-500/5 via-transparent to-blue-500/5 group-hover:opacity-70" 
                                    : "from-primary/10 via-transparent to-blue-500/10 group-hover:opacity-100"
                            )} />
                            <div className="relative z-10">
                                {feature.upcoming && (
                                    <Badge className="absolute top-0 right-0 bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
                                        Coming Soon
                                    </Badge>
                                )}
                                <div className={cn(
                                    "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300",
                                    feature.upcoming 
                                        ? "bg-blue-500/10 text-blue-500" 
                                        : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                )}>
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className={cn(
                                    "text-xl font-semibold mb-4 transition-colors duration-300",
                                    feature.upcoming 
                                        ? "text-foreground/80" 
                                        : "text-foreground group-hover:text-primary"
                                )}>
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <Link href="/features">
                        <Button variant="outline" className="h-12 px-6 text-lg font-medium gap-2 rounded-xl group">
                            <SparklesIcon className="h-5 w-5" />
                            Explore All Features
                            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
} 