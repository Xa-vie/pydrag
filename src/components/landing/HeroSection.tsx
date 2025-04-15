import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightIcon, PlayIcon, ShieldCheckIcon, ZapIcon } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
    return (
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
    );
} 