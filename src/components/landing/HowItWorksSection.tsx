import { Badge } from '@/components/ui/badge';
import { MousePointerIcon, ArrowRightIcon, CodeIcon, BoxIcon, ChevronDownIcon } from 'lucide-react';

const STEPS = [
    {
        step: "1",
        title: "Select Blocks",
        description: "Choose code blocks from our extensive library of Python components",
        icon: BoxIcon,
        illustration: (
            <div className="relative w-full aspect-video bg-black/90 rounded-lg overflow-hidden border border-border shadow-md transform transition-transform hover:scale-[1.02] duration-300">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute left-6 top-0 bottom-0 w-[120px] border-r border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60 font-medium mb-4">Components</div>
                    <div className="space-y-2">
                        <div className="bg-primary/20 p-2 rounded flex items-center justify-center cursor-grab border border-primary/30">
                            <div className="w-full h-3 bg-primary/40 rounded-sm"></div>
                        </div>
                        <div className="bg-blue-500/20 p-2 rounded flex items-center justify-center cursor-grab border border-blue-500/30">
                            <div className="w-4 h-4 rounded-sm border-2 border-blue-400"></div>
                        </div>
                    </div>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
                    <MousePointerIcon className="h-6 w-6 text-white/80 absolute -left-3 -top-3" />
                    <div className="bg-primary/30 h-10 w-24 rounded border border-primary/50 shadow-lg backdrop-blur-sm flex items-center justify-center">
                        <span className="text-xs text-white/90">If Block</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        step: "2",
        title: "Position & Move",
        description: "Place blocks on the canvas and move them around - indentation happens automatically",
        icon: MousePointerIcon,
        illustration: (
            <div className="relative w-full aspect-video bg-black/90 rounded-lg overflow-hidden border border-border shadow-md transform transition-transform hover:scale-[1.02] duration-300">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute left-[30%] top-[30%] bg-primary/30 h-12 w-32 rounded border border-primary/50 flex items-center justify-center">
                    <span className="text-xs text-white/90">If condition:</span>
                </div>
                <div className="absolute left-[35%] top-[50%] bg-blue-500/30 h-10 w-28 rounded border border-blue-500/50 flex items-center justify-center">
                    <span className="text-xs text-white/90">Print value</span>
                </div>
                <div className="absolute left-[32%] top-[40%] w-[3px] h-[10%] bg-primary/30"></div>
                <div className="absolute left-[40%] top-[65%] bg-green-500/30 h-10 w-28 rounded border border-green-500/50 flex items-center justify-center">
                    <span className="text-xs text-white/90">Return result</span>
                </div>
                <div className="absolute right-[20%] top-[40%] animate-pulse">
                    <MousePointerIcon className="h-5 w-5 text-white absolute -left-3 -top-3" />
                    <div className="flex items-center gap-1">
                        <ArrowRightIcon className="h-5 w-5 text-primary" />
                        <span className="text-xs text-white/80">Auto-indent</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        step: "3",
        title: "Instant Code Generation",
        description: "See your Python code generated in real-time as you arrange blocks",
        icon: CodeIcon,
        illustration: (
            <div className="relative w-full aspect-video bg-black/90 rounded-lg overflow-hidden border border-border shadow-md transform transition-transform hover:scale-[1.02] duration-300">
                <div className="grid grid-cols-2 h-full">
                    {/* Visual Canvas Side */}
                    <div className="border-r border-white/10 p-4 relative">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        
                        {/* Parent Block */}
                        <div className="absolute left-[15%] top-[20%] bg-primary/30 h-12 w-44 rounded border border-primary/50 flex items-center justify-center shadow-sm">
                            <span className="text-xs text-white/90 font-mono">if value {`>`} threshold:</span>
                        </div>
                        
                        {/* Connection Line */}
                        <div className="absolute left-[20%] top-[32%] w-[3px] h-[10%] bg-primary/30"></div>
                        
                        {/* Child Block */}
                        <div className="absolute left-[25%] top-[42%] bg-blue-500/30 h-10 w-36 rounded border border-blue-500/50 flex items-center justify-center shadow-sm">
                            <span className="text-xs text-white/90 font-mono">print(result)</span>
                        </div>
                        
                        {/* Parent Block 2 */}
                        <div className="absolute left-[15%] top-[60%] bg-green-500/30 h-10 w-44 rounded border border-green-500/50 flex items-center justify-center shadow-sm">
                            <span className="text-xs text-white/90 font-mono">return final_value</span>
                        </div>
                        
                        {/* Info label */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded text-[10px] text-white/70 backdrop-blur-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            Visual Canvas
                        </div>
                    </div>
                    
                    {/* Code Side */}
                    <div className="bg-[#1E1E1E] p-5 font-mono text-xs overflow-hidden relative">
                        <div className="text-white/90 leading-relaxed space-y-1">
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-3 select-none w-5 text-right">1</span>
                                <span className="text-blue-400">if</span>
                                <span className="text-white/80 mx-1">value {`>`} threshold:</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-3 select-none w-5 text-right">2</span>
                                <span className="ml-4 text-blue-400">print</span>
                                <span className="text-white/80">(result)</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-3 select-none w-5 text-right">3</span>
                                <span></span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-3 select-none w-5 text-right">4</span>
                                <span className="text-blue-400">return</span>
                                <span className="text-white/80 ml-1">final_value</span>
                            </div>
                        </div>
                        
                        {/* Code editor window controls */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded text-[10px] text-white/70 backdrop-blur-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                            Generated Python Code
                        </div>
                        
                        {/* Animation indicator */}
                        <div className="absolute bottom-3 right-3">
                            <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-1 rounded-full text-[10px] text-primary">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                                Auto-updating
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Middle connector */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center border border-white/10 shadow-lg">
                        <ArrowRightIcon className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </div>
        )
    }
];

export function HowItWorksSection() {
    return (
        <section className="w-full py-36 relative overflow-hidden bg-gradient-to-b from-background to-background/90">
            {/* Subtle background patterns */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(0,0,0,0.01)_49%,rgba(0,0,0,0.01)_51%,transparent)] bg-[size:8px_100%] pointer-events-none opacity-70"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIxMjEyNyIgc3Ryb2tlLXdpZHRoPSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]"></div>
            <div className="absolute left-0 top-1/4 w-1/3 h-1/3 bg-gradient-radial from-primary/[0.03] to-transparent blur-3xl pointer-events-none"></div>
            <div className="absolute right-0 bottom-1/4 w-1/3 h-1/3 bg-gradient-radial from-blue-500/[0.03] to-transparent blur-3xl pointer-events-none"></div>
            
            <div className="container px-4 md:px-6 relative mx-auto max-w-7xl">
                <div className="mx-auto max-w-4xl text-center mb-20">
                    <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-medium mb-6 inline-flex items-center">
                        <span className="w-1 h-1 rounded-full bg-primary mr-2"></span>
                        Simple Process
                    </Badge>
                    
                    <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-6 text-foreground">
                        How PyDrag Works
                    </h2>
                    
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Create Python applications visually with automatic indentation
                    </p>
                </div>

                <div className="space-y-36 md:space-y-44 relative">
                    {/* Timeline connector */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-muted to-transparent hidden md:block"></div>
                    
                    {STEPS.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Down arrow connector for non-last items */}
                            {index < STEPS.length - 1 && (
                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 z-20 hidden md:flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 text-muted-foreground">
                                        <ChevronDownIcon className="h-5 w-5" />
                                    </div>
                                </div>
                            )}
                            
                            {/* Step number - desktop */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-20 hidden md:flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-md transition-transform hover:scale-110 duration-300">
                                    {step.step}
                                </div>
                            </div>
                            
                            <div className={`grid md:grid-cols-2 gap-y-8 md:gap-x-16 items-center ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                                {/* Content Side */}
                                <div className={`${index % 2 === 1 ? 'md:order-2' : ''} md:px-8`}>
                                    <div className="flex items-center gap-4 mb-5 md:hidden">
                                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shadow-md">
                                            {step.step}
                                        </div>
                                        <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
                                    </div>
                                    
                                    <div className="md:hidden mb-8">
                                        {step.illustration}
                                    </div>
                                    
                                    <div className="md:bg-background/50 md:backdrop-blur-sm md:border md:border-border/40 md:p-8 md:rounded-xl md:shadow-sm">
                                        <h3 className="text-3xl font-semibold mb-5 text-foreground hidden md:block">{step.title}</h3>
                                        <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                                            {step.description}
                                        </p>
                                        
                                        <div className="inline-flex items-center gap-2.5 text-primary bg-primary/5 px-4 py-3 rounded-lg">
                                            <step.icon className="h-5 w-5" />
                                            <span className="font-medium">
                                                {index === 0 ? 'Choose from our library of blocks' : 
                                                 index === 1 ? 'No need to manually indent code' :
                                                 'Python code updates as you build'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Illustration Side - desktop only */}
                                <div className={`${index % 2 === 1 ? 'md:order-1' : ''} hidden md:block md:px-8`}>
                                    {step.illustration}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
} 