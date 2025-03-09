import { Button } from '@/components/ui/button';
import { RocketIcon, CodeIcon, ShieldCheckIcon, PackageIcon, GitBranchIcon, SparklesIcon, DownloadIcon, TerminalIcon, ShareIcon, PlayIcon, RefreshCwIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LandingPage() {
    return (
        <ScrollArea className="flex flex-col max-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-800"> */}
            {/* Hero Section */}
            <main className="flex-1">
                <section className="w-full min-h-screen flex items-center justify-center py-20 md:py-32 lg:py-40 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[128px] dark:bg-blue-900/20 animate-pulse" />
                        <div className="absolute -top-40 -right-20 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[128px] dark:bg-purple-900/20 animate-pulse" />
                        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-green-100/20 rounded-full blur-[128px] dark:bg-green-900/20 animate-pulse" />
                    </div>

                    <div className="container px-4 md:px-6 relative">
                        <div className="flex flex-col items-center space-y-12 text-center">
                            <div className="space-y-8 max-w-4xl relative">
                                <div className="inline-block animate-bounce-slow">
                                    <span className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                        Now in Public Beta 🚀
                                    </span>
                                </div>
                                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl/none">
                                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[size:400%] animate-gradient">
                                        Py Drag
                                    </span>
                                    <br />
                                    <span className="text-3xl sm:text-4xl md:text-5xl font-medium bg-gradient-to-r from-gray-600 to-gray-500 dark:from-gray-300 dark:to-gray-400 bg-clip-text text-transparent mt-4 block">
                                        Think in Blocks, Build in Code
                                    </span>
                                </h1>
                                <p className="mx-auto max-w-[800px] text-xl text-gray-600/90 md:text-2xl dark:text-gray-300/90 leading-relaxed">
                                    Transform your ideas into Python applications visually. Our intuitive drag-and-drop interface 
                                    makes programming accessible to beginners while empowering experts to prototype rapidly.
                                </p>
                                <div className="flex gap-6 justify-center flex-wrap relative z-20">
                                    <Link href="/signin">
                                        <Button className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium gap-2 group bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30">
                                            Start Building Free
                                            <RocketIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                    <Link href="/demo">
                                        <Button variant="outline" className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium gap-2 border-2 bg-white/5 backdrop-blur-sm hover:bg-white/10 dark:border-gray-700 rounded-xl transition-all duration-200">
                                            <CodeIcon className="h-5 w-5" />
                                            Live Demo
                                        </Button>
                                    </Link>
                                </div>
                                <div className="pt-8 flex items-center justify-center gap-8 text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                                        <span>No Credit Card Required</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon className="h-5 w-5 text-blue-500" />
                                        <span>AI-Powered</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Features Section */}
                <section className="w-full py-32 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[120px] dark:bg-blue-900/10" />
                        <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-[120px] dark:bg-purple-900/10" />
                    </div>
                    <div className="container px-4 md:px-6 relative">
                        <div className="mx-auto max-w-4xl text-center mb-24">
                            <div className="inline-block mb-6">
                                <span className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                    Powerful Features ✨
                                </span>
                            </div>
                            <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                                Why Choose PyDrag?
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Experience a revolutionary approach to Python development with features designed for both beginners and experts.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {FEATURES.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700/50 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className={cn(
                                            "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300",
                                            feature.iconColor,
                                            "group-hover:scale-110 group-hover:shadow-lg"
                                        )}>
                                            <feature.icon className={cn("h-6 w-6", feature.iconClass)} />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-20 text-center">
                            <Link href="/features">
                                <Button variant="outline" className="inline-flex items-center justify-center h-12 px-6 text-lg font-medium gap-2 border-2 bg-white/50 backdrop-blur-sm hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800 dark:border-gray-700 rounded-xl transition-all duration-200">
                                    <SparklesIcon className="h-5 w-5" />
                                    Explore All Features
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="w-full py-32 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/2 top-0 w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[120px] dark:bg-blue-900/10 -translate-x-1/2" />
                    </div>
                    <div className="container px-4 md:px-6 relative">
                        <div className="mx-auto max-w-4xl text-center mb-24">
                            <div className="inline-block mb-6">
                                <span className="px-3 py-1 text-sm font-medium bg-purple-50 text-purple-600 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                                    Simple Process 🎯
                                </span>
                            </div>
                            <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                                How PyDrag Works
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Get started with PyDrag in three simple steps
                            </p>
                        </div>

                        <div className="grid gap-12 md:grid-cols-3 relative">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 -translate-y-1/2 hidden md:block" />
                            {[
                                {
                                    step: "1",
                                    title: "Drag & Drop",
                                    description: "Choose from our library of Python blocks and drag them onto your canvas",
                                    icon: CodeIcon,
                                    color: "from-blue-600 to-purple-600"
                                },
                                {
                                    step: "2",
                                    title: "Connect & Configure",
                                    description: "Connect blocks together and configure their properties to build your logic",
                                    icon: RocketIcon,
                                    color: "from-purple-600 to-pink-600"
                                },
                                {
                                    step: "3",
                                    title: "Execute & Export",
                                    description: "Run your code instantly in the browser or export it as a Python file",
                                    icon: SparklesIcon,
                                    color: "from-pink-600 to-blue-600"
                                }
                            ].map((step, index) => (
                                <div key={index} className="relative">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl relative z-10 border border-gray-100 dark:border-gray-700/50 h-full">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                                {step.step}
                                            </div>
                                        </div>
                                        <div className="mt-8 text-center">
                                            <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="w-full py-32 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-purple-100/20 rounded-full blur-[120px] dark:bg-purple-900/10" />
                        <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-[120px] dark:bg-blue-900/10" />
                    </div>
                    <div className="container px-4 md:px-6 relative">
                        <div className="mx-auto max-w-4xl text-center mb-24">
                            <div className="inline-block mb-6">
                                <span className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                    Testimonials ⭐
                                </span>
                            </div>
                            <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                                Loved by Developers
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
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
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl relative">
                                    <div className="absolute -top-4 -left-4">
                                        <span className="text-6xl text-blue-600/20">&quot;</span>
                                    </div>
                                    <div className="relative">
                                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                            {testimonial.quote}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                                            <div>
                                                <h4 className="font-semibold">{testimonial.author}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Getting Started Section */}
                <section className="w-full py-32 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/2 top-0 w-[800px] h-[800px] bg-green-100/20 rounded-full blur-[120px] dark:bg-green-900/10 -translate-x-1/2" />
                    </div>
                    <div className="container px-4 md:px-6 relative">
                        <div className="mx-auto max-w-5xl bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
                            <div className="relative">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                                    Ready to Start Building?
                                </h2>
                                <p className="text-xl text-blue-100 mb-8 max-w-3xl">
                                    Join thousands of developers who are already building amazing Python applications with PyDrag.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/signin">
                                        <Button className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-6 text-lg font-medium rounded-xl">
                                            Get Started Free
                                        </Button>
                                    </Link>
                                    <Link href="/docs">
                                        <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-12 px-6 text-lg font-medium rounded-xl">
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
            <footer className="w-full py-12 border-t bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PyDrag</h3>
                            <p className="text-gray-600 dark:text-gray-300 max-w-xs">
                                Empowering developers to build Python applications visually
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Product</h4>
                                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                                    <li><Link href="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link></li>
                                    <li><Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</Link></li>
                                    <li><Link href="/docs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Community</h4>
                                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                                    <li><Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link></li>
                                    <li><Link href="/forum" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Forum</Link></li>
                                    <li><Link href="/github" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Legal</h4>
                                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                                    <li><Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</Link></li>
                                    <li><Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</Link></li>
                                    <li><Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t text-center text-gray-600 dark:text-gray-300">
                        <p>© 2024 PyDrag. All rights reserved.</p>
                    </div>
                </div>
            </footer>
            {/* </div> */}
        </ScrollArea>
    );
}

const FEATURES = [
    {
        icon: CodeIcon,
        title: "Visual Programming",
        description: "Build complex logic with drag-and-drop blocks and real-time code generation",
        iconColor: "bg-purple-100 dark:bg-purple-900/50",
        iconClass: "text-purple-600 dark:text-purple-400"
    },
    {
        icon: RocketIcon,
        title: "Instant Execution",
        description: "Run code directly in the browser with our secure sandbox environment",
        iconColor: "bg-blue-100 dark:bg-blue-900/50",
        iconClass: "text-blue-600 dark:text-blue-400"
    },
    {
        icon: ShieldCheckIcon,
        title: "Smart Validation",
        description: "Real-time error checking and syntax validation as you build",
        iconColor: "bg-green-100 dark:bg-green-900/50",
        iconClass: "text-green-600 dark:text-green-400"
    },
    {
        icon: DownloadIcon,
        title: "Export Anywhere",
        description: "Export your projects as Python files ready for execution in any environment",
        iconColor: "bg-orange-100 dark:bg-orange-900/50",
        iconClass: "text-orange-600 dark:text-orange-400"
    },
    {
        icon: ShareIcon,
        title: "Easy Sharing",
        description: "Share your projects instantly with shareable links or export to GitHub",
        iconColor: "bg-pink-100 dark:bg-pink-900/50",
        iconClass: "text-pink-600 dark:text-pink-400"
    },
    {
        icon: SparklesIcon,
        title: "AI Assistant",
        description: "Get code suggestions and debugging help with AI integration",
        iconColor: "bg-yellow-100 dark:bg-yellow-900/50",
        iconClass: "text-yellow-600 dark:text-yellow-400"
    },
];