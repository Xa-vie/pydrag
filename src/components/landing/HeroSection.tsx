import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightIcon, CheckCircleIcon, CodeIcon, BoxIcon, MousePointerIcon, ChevronsRightIcon } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
    return (
        <section className="w-full min-h-screen relative overflow-hidden bg-gradient-to-b from-background to-background/95">
            {/* Abstract shapes background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] bg-gradient-to-tr from-blue-600/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIxMjEyNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />
            </div>
            
            <div className="container relative z-10 h-screen flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-16 backdrop-blur-sm flex items-center justify-end px-4 border-b border-border/40">
                    <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-primary/30 bg-background/80 text-primary backdrop-blur-sm">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                            Public Beta Now Available
                        </Badge>
                </div>
                
                <div className="flex-1 flex items-center justify-center py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4 w-full max-w-7xl">
                        <div className="lg:col-span-3 flex flex-col justify-center space-y-8 lg:pr-12">
                            <div className="space-y-6">
                                <h1 className="text-6xl font-bold tracking-tight sm:text-7xl">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-foreground">Py</span>
                                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Drag</span>
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-medium mt-6 flex items-center gap-2">
                                        <span className="text-foreground/80">Visual Python Development</span>
                                        <span className="h-6 w-[2px] bg-primary animate-pulse"></span>
                                    </div>
                        </h1>
                        
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    Build Python applications without writing a single line of code.
                                    Our visual interface transforms the way you create, with all the power of 
                                    <span className="text-primary"> Python</span> in a simple drag-and-drop canvas.
                        </p>
                            </div>
                        
                            <div className="flex items-center gap-6">
                            <Link href="/signin">
                                    <Button size="lg" className="h-12 px-6 text-base rounded-md font-medium border-2 border-primary bg-primary hover:bg-primary/90 hover:border-primary/90 transition-all">
                                        Try PyDrag Free
                                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        
                            <div className="pt-6 grid grid-cols-2 gap-4 max-w-md">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    <span>Export as .py Files</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    <span>Real-time Preview</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    <span>Standard Libraries</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-2 flex items-center justify-center lg:justify-end">
                            <div className="w-full max-w-md aspect-[4/3] relative">
                                {/* Drag and Drop Interface */}
                                <div className="absolute inset-0 bg-black/90 border border-primary/20 shadow-[0_0_15px_rgba(0,0,0,0.2)] backdrop-blur-sm overflow-hidden rounded-md">
                                    {/* Header */}
                                    <div className="h-8 bg-black flex items-center gap-1.5 px-4 border-b border-white/10">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <div className="ml-4 text-xs text-white/60 font-mono">PyDrag Editor</div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="grid grid-cols-6 h-[calc(100%-32px)]">
                                        {/* Components Panel */}
                                        <div className="col-span-1 border-r border-white/10 p-2 bg-black/60">
                                            <div className="text-xs text-white/60 mb-2 font-medium">Components</div>
                                            <div className="space-y-2">
                                                <div className="bg-primary/20 p-2 rounded flex items-center justify-center cursor-grab active:cursor-grabbing border border-primary/30 group hover:bg-primary/30 transition-colors">
                                                    <BoxIcon className="h-4 w-4 text-primary group-hover:text-primary/90" />
                                                </div>
                                                <div className="bg-blue-500/20 p-2 rounded flex items-center justify-center cursor-grab border border-blue-500/30 group hover:bg-blue-500/30 transition-colors">
                                                    <div className="h-4 w-4 rounded-full border-2 border-blue-400 group-hover:border-blue-300" />
                                                </div>
                                                <div className="bg-green-500/20 p-2 rounded flex items-center justify-center cursor-grab border border-green-500/30 group hover:bg-green-500/30 transition-colors">
                                                    <div className="h-1 w-4 bg-green-400 rounded-full group-hover:bg-green-300" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Canvas and Code View */}
                                        <div className="col-span-5 grid grid-rows-2">
                                            {/* Canvas */}
                                            <div className="relative border-b border-white/10 bg-black/40 p-4 overflow-hidden">
                                                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                                
                                                {/* Element being dragged */}
                                                <div className="absolute left-[30%] top-[40%] animate-pulse">
                                                    <MousePointerIcon className="h-5 w-5 text-white absolute -left-3 -top-3" />
                                                    <div className="bg-primary/40 h-16 w-24 rounded border border-primary/50 shadow-lg backdrop-blur-sm flex items-center justify-center">
                                                        <BoxIcon className="h-5 w-5 text-primary" />
                                                    </div>
                                                </div>
                                                
                                                {/* Already placed elements */}
                                                <div className="absolute left-[10%] top-[20%] bg-blue-500/30 h-10 w-10 rounded-full border border-blue-500/50 flex items-center justify-center">
                                                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                                                </div>
                                                
                                                <div className="absolute right-[20%] bottom-[30%] bg-green-500/30 h-2 w-32 rounded-full border border-green-500/50"></div>
                                            </div>
                                            
                                            {/* Code View */}
                                            <div className="bg-[#1E1E1E] p-4 font-mono text-sm overflow-hidden relative">
                                                <div className="text-xs text-white/60 mb-2 font-medium flex items-center">
                                                    <CodeIcon className="h-3.5 w-3.5 mr-1.5" />
                                                    Generated Code
                                                    <div className="ml-2 flex items-center gap-1.5 opacity-80">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                        <span className="text-[10px] text-green-400">Auto-updating</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-white/90 leading-relaxed">
                                                    <div className="flex">
                                                        <span className="text-gray-500 mr-4">1</span>
                                                        <span className="text-blue-400">import</span>
                                                        <span className="text-white/80 mx-1">pygame</span>
                                                    </div>
                                                    <div className="flex">
                                                        <span className="text-gray-500 mr-4">2</span>
                                                        <span></span>
                                                    </div>
                                                    <div className="flex">
                                                        <span className="text-gray-500 mr-4">3</span>
                                                        <span className="text-blue-400">class</span>
                                                        <span className="text-green-400 mx-1">GameObject</span>
                                                        <span className="text-white/80">:</span>
                                                    </div>
                                                    <div className="flex">
                                                        <span className="text-gray-500 mr-4">4</span>
                                                        <span className="ml-4 text-white/80">...</span>
                                                    </div>
                                                    <div className="flex relative">
                                                        <span className="text-gray-500 mr-4">5</span>
                                                        <div className="flex items-center animate-pulse">
                                                            <ChevronsRightIcon className="h-4 w-4 text-primary mr-1" />
                                                            <span className="text-blue-400">def</span>
                                                            <span className="text-yellow-400 mx-1">draw</span>
                                                            <span className="text-white/80">(self):</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex relative">
                                                        <span className="text-gray-500 mr-4">6</span>
                                                        <div className="animate-pulse">
                                                            <span className="ml-8 text-white/80">pygame.draw.rect(screen, self.color, self.rect)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Decorative elements */}
                                <div className="absolute -top-3 -left-3 w-full h-full border border-primary/30 rounded-md -z-10"></div>
                                <div className="absolute -bottom-3 -right-3 w-full h-full border border-blue-500/30 rounded-md -z-10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} 