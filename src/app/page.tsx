import { ScrollArea } from '@/components/ui/scroll-area';
import { HeroSection, FeaturesSection, HowItWorksSection, TestimonialsSection } from '@/components/landing';

export default function LandingPage() {
    return (
        <ScrollArea className="flex flex-col max-h-screen">
            <main className="flex-1">
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <TestimonialsSection />
            </main>
        </ScrollArea>
    );
}