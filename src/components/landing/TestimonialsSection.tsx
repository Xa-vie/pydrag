import { Badge } from '@/components/ui/badge';

const TESTIMONIALS = [
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
];

export function TestimonialsSection() {
    return (
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
                    {TESTIMONIALS.map((testimonial, index) => (
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
    );
} 