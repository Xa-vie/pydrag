import { Badge } from '@/components/ui/badge';
import { MousePointerClickIcon, RocketIcon, ZapIcon } from 'lucide-react';

const STEPS = [
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
];

export function HowItWorksSection() {
    return (
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
                    
                    {STEPS.map((step, index) => (
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
    );
} 