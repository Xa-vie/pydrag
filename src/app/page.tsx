import { Button } from '@/components/ui/button';
import { RocketIcon, CodeIcon, ShieldCheckIcon, PackageIcon, GitBranchIcon, SparklesIcon, DownloadIcon, TerminalIcon, ShareIcon, PlayIcon, RefreshCwIcon, ArrowRightIcon, MousePointerClickIcon, ZapIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
    return (
        <ScrollArea className="flex flex-col max-h-screen">
            {/* Hero Section */}
            <main className="flex-1">
                <section className="w-full min-h-screen flex items-center justify-center py-20 md:py-32 relative overflow-hidden bg-background">
                    {/* Background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24%,hsl(var(--muted))/5%_25%,transparent_26%)] bg-[length:6px_6px]" />
                        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent" />
                        <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-gradient-conic from-primary/10 via-transparent" />
                    </div>
                    
                    <div className="container px-4 md:px-6 relative z-10">
                        <div className="flex flex-col items-center space-y-12 text-center">
                            <div className="space-y-6 max-w-5xl relative">
                                <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-medium">
                                    Public Beta Now Available
                                </Badge>
                                
                                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                                    <span className="relative">
                                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                            PyDrag
                                        </span>
                                        <span className="absolute -bottom-1.5 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-70"></span>
                                    </span>
                                    <br />
                                    <span className="text-3xl sm:text-4xl md:text-5xl font-medium text-foreground/80 mt-4 block">
                                        Visual Python Development
                                    </span>
                                </h1>
                                
                                <p className="mx-auto max-w-[800px] text-xl text-muted-foreground md:text-2xl leading-relaxed mt-8">
                                    Transform your ideas into Python applications visually. Our intuitive drag-and-drop interface 
                                    makes programming accessible to beginners while empowering experts to prototype rapidly.
                                </p>
                                
                                <div className="flex flex-wrap gap-6 justify-center mt-12 relative z-20">
                                    <Link href="/signin">
                                        <Button size="lg" className="h-14 px-8 text-lg font-medium rounded-xl gap-2 bg-primary hover:bg-primary/90 group">
                                            Get Started Free
                                            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                    <Link href="/demo">
                                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium rounded-xl border gap-2">
                                            <PlayIcon className="h-4 w-4" />
                                            Live Demo
                                        </Button>
                                    </Link>
                                </div>
                                
                                <div className="pt-10 flex items-center justify-center gap-8 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                                        <span>No Credit Card Required</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ZapIcon className="h-5 w-5 text-primary" />
                                        <span>AI-Powered</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
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
                                    className="group relative bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-sm" />
                                    <div className="relative z-10">
                                        <div className={cn(
                                            "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300",
                                            "bg-primary/10 text-primary",
                                            "group-hover:bg-primary/20"
                                        )}>
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
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

                {/* How It Works Section */}
                <section className="w-full py-32 relative overflow-hidden bg-background">
                    <div className="container px-4 md:px-6 relative">
                        <div className="mx-auto max-w-4xl text-center mb-20">
                            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-medium mb-6">
                                Simple Process
                            </Badge>
                            
                            <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-6 text-foreground">
                                How PyDrag Works
                            </h2>
                            
                            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                Get started with PyDrag in three simple steps
                            </p>
                        </div>

                        <div className="grid gap-12 md:grid-cols-3 relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 -translate-y-1/2 hidden md:block" />
                            
                            {[
                                {
                                    step: "1",
                                    title: "Drag & Drop",
                                    description: "Choose from our library of Python blocks and drag them onto your canvas",
                                    icon: MousePointerClickIcon,
                                },
                                {
                                    step: "2",
                                    title: "Connect & Configure",
                                    description: "Connect blocks together and configure their properties to build your logic",
                                    icon: RocketIcon,
                                },
                                {
                                    step: "3",
                                    title: "Execute & Export",
                                    description: "Run your code instantly in the browser or export it as a Python file",
                                    icon: ZapIcon,
                                }
                            ].map((step, index) => (
                                <div key={index} className="relative">
                                    <div className="bg-background rounded-2xl p-8 shadow-sm border border-border relative z-10 h-full">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold">
                                                {step.step}
                                            </div>
                                        </div>
                                        <div className="mt-8 text-center">
                                            <h3 className="text-2xl font-semibold mb-4 text-foreground">{step.title}</h3>
                                            <p className="text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="w-full py-32 bg-muted/30 relative overflow-hidden">
                    <div className="container px-4 md:px-6 relative">
                        <div className="mx-auto max-w-4xl text-center mb-20">
                            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-medium mb-6">
                                Testimonials
                            </Badge>
                            
                            <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-6 text-foreground">
                                Loved by Developers
                            </h2>
                            
                            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                See what our users have to say about PyDrag
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    quote: "PyDrag has revolutionized how I teach Python to my students. The visual approach makes complex concepts so much more accessible.",
                                    author: "Sarah Chen",
                                    role: "Computer Science Teacher"
                                },
                                {
                                    quote: "As a professional developer, I use PyDrag for rapid prototyping. It's incredible how quickly I can test new ideas.",
                                    author: "Michael Rodriguez",
                                    role: "Senior Software Engineer"
                                },
                                {
                                    quote: "The AI assistance and real-time validation have helped me catch bugs early. It's like having a mentor right beside you.",
                                    author: "Emma Thompson",
                                    role: "Python Developer"
                                }
                            ].map((testimonial, index) => (
                                <div key={index} className="bg-background rounded-2xl p-8 shadow-sm border border-border relative">
                                    <div className="absolute -top-4 -left-4">
                                        <span className="text-6xl text-primary/20">&quot;</span>
                                    </div>
                                    <div className="relative">
                                        <p className="text-muted-foreground mb-6 leading-relaxed">
                                            {testimonial.quote}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary">
                                                {testimonial.author.split(' ').map(name => name[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{testimonial.author}</h4>
                                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Getting Started Section */}
                <section className="w-full py-32 relative overflow-hidden bg-background">
                    <div className="container px-4 md:px-6 relative">
                        <div className="mx-auto max-w-5xl bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-12 md:p-16 shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                            <div className="relative">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                                    Ready to Start Building?
                                </h2>
                                <p className="text-xl text-white/80 mb-8 max-w-3xl">
                                    Join thousands of developers who are already building amazing Python applications with PyDrag.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/signin">
                                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-6 text-lg font-medium rounded-xl">
                                            Get Started Free
                                        </Button>
                                    </Link>
                                    <Link href="/docs">
                                        <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-12 px-6 text-lg font-medium rounded-xl">
                                            Read the Docs
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-12 border-t bg-background">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <TerminalIcon className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">PyDrag</h3>
                            </div>
                            <p className="text-muted-foreground max-w-xs">
                                Empowering developers to build Python applications visually
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-foreground">Product</h4>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                                    <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                                    <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-foreground">Community</h4>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                                    <li><Link href="/forum" className="hover:text-primary transition-colors">Forum</Link></li>
                                    <li><Link href="/github" className="hover:text-primary transition-colors">GitHub</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-foreground">Legal</h4>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                                    <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
                                    <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
                        <p>© {new Date().getFullYear()} PyDrag. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </ScrollArea>
    );
}

const FEATURES = [
    {
        icon: CodeIcon,
        title: "Visual Programming",
        description: "Build complex logic with drag-and-drop blocks and real-time code generation",
    },
    {
        icon: PlayIcon,
        title: "Instant Execution",
        description: "Run code directly in the browser with our secure sandbox environment",
    },
    {
        icon: ShieldCheckIcon,
        title: "Smart Validation",
        description: "Real-time error checking and syntax validation as you build",
    },
    {
        icon: DownloadIcon,
        title: "Export Anywhere",
        description: "Export your projects as Python files ready for execution in any environment",
    },
    {
        icon: ShareIcon,
        title: "Easy Sharing",
        description: "Share your projects instantly with shareable links or export to GitHub",
    },
    {
        icon: SparklesIcon,
        title: "AI Assistant",
        description: "Get code suggestions and debugging help with AI integration",
    },
];