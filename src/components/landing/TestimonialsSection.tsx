import { Badge } from '@/components/ui/badge';
import { StarIcon } from 'lucide-react';

const TESTIMONIALS = [
    {
        quote: "PyDrag has revolutionized how I teach Python to my students. The visual approach makes complex concepts so much more accessible.",
        author: "Sarah Chen",
        role: "Computer Science Teacher",
        company: "Stanford University",
        rating: 5,
        avatarColor: "bg-green-500/10",
        textColor: "text-green-500"
    },
    {
        quote: "As a professional developer, I use PyDrag for rapid prototyping. It&apos;s incredible how quickly I can test new ideas and visualize data flows.",
        author: "Michael Rodriguez",
        role: "Senior Software Engineer",
        company: "Dataflow Systems",
        rating: 5,
        avatarColor: "bg-blue-500/10",
        textColor: "text-blue-500"
    },
    {
        quote: "The keyboard shortcuts and block navigation have helped me create Python code much faster than traditional methods. Perfect for educational settings.",
        author: "Emma Thompson",
        role: "Python Developer",
        company: "EduTech Solutions",
        rating: 4,
        avatarColor: "bg-purple-500/10",
        textColor: "text-purple-500"
    }
];

export function TestimonialsSection() {
    return (
        <section className="w-full py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-gradient-radial from-primary/5 to-transparent blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-blue-500/5 to-transparent blur-2xl"></div>
                <div className="absolute right-0 top-1/4 -rotate-45 text-9xl font-bold text-foreground/[0.02]">REVIEWS</div>
            </div>
            
            <div className="container px-4 md:px-6 relative">
                <div className="mx-auto max-w-4xl text-center mb-16">
                    <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-medium mb-6">
                        Testimonials
                    </Badge>
                    
                    <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-6 text-foreground">
                        What Our Users Say
                    </h2>
                    
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Join thousands of developers who are building with PyDrag
                    </p>
                </div>

                <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 relative z-10">
                    {TESTIMONIALS.map((testimonial, index) => (
                        <div 
                            key={index} 
                            className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-border/70 relative hover:shadow-lg transition-all group"
                        >
                            {/* Quote mark */}
                            <div className="absolute -top-5 -left-3 z-0">
                                <span className="text-7xl opacity-10 font-serif">&ldquo;</span>
                            </div>
                            
                            {/* Rating stars */}
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon 
                                        key={i} 
                                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                                    />
                                ))}
                            </div>
                            
                            <div className="relative z-10">
                                <p className="text-foreground/90 mb-6 leading-relaxed">
                                &quot;{testimonial.quote}&quot;
                                </p>
                                
                                <div className="flex items-center">
                                    <div className={`w-12 h-12 rounded-full ${testimonial.avatarColor} flex items-center justify-center font-medium ${testimonial.textColor} border border-border mr-4`}>
                                        {testimonial.author.split(' ').map(name => name[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-foreground">{testimonial.author}</h4>
                                        <div className="flex flex-col xs:flex-row xs:items-center gap-x-2">
                                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                            <div className="hidden xs:block text-muted-foreground/40">•</div>
                                            <p className="text-sm font-medium text-muted-foreground">{testimonial.company}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bottom decoration */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>

                {/* Stats section */}
                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-bold text-foreground mb-2">10k+</span>
                        <span className="text-sm text-muted-foreground">Active Users</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-bold text-foreground mb-2">4.8</span>
                        <span className="text-sm text-muted-foreground">Average Rating</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-bold text-foreground mb-2">25k+</span>
                        <span className="text-sm text-muted-foreground">Projects Created</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-bold text-foreground mb-2">98%</span>
                        <span className="text-sm text-muted-foreground">Satisfaction Rate</span>
                    </div>
                </div>
            </div>
        </section>
    );
} 