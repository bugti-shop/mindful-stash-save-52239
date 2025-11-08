import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Shield, Bell, ChartBar } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import foldersImg from '@/assets/onboarding-folders.jpg';
import analyticsImg from '@/assets/onboarding-analytics.jpg';
import createImg from '@/assets/onboarding-create.jpg';
import recurringImg from '@/assets/onboarding-recurring.jpg';
import investmentImg from '@/assets/onboarding-investment.jpg';

const slides = [
  {
    icon: Wallet,
    title: 'Organize Your Savings',
    description: 'Create unlimited jars to organize your savings goals. Track each goal separately and watch your progress grow.',
    color: '#3c78f0',
    image: foldersImg,
  },
  {
    icon: TrendingUp,
    title: 'Track Your Progress',
    description: 'Visual charts and insights help you understand your saving patterns. See exactly where your money goes.',
    color: '#3c78f0',
    image: analyticsImg,
  },
  {
    icon: Shield,
    title: 'Secure Backup & Sync',
    description: 'Your data is automatically backed up and synced across all your devices. Never lose your financial records.',
    color: '#3c78f0',
    image: createImg,
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Set custom reminders for your savings goals. Stay on track with personalized notifications.',
    color: '#3c78f0',
    image: recurringImg,
  },
  {
    icon: ChartBar,
    title: 'Advanced Analytics',
    description: 'Get detailed insights into your savings trends. Make smarter financial decisions with data-driven analytics.',
    color: '#3c78f0',
    image: investmentImg,
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();

  const handleNext = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Navigate to paywall after onboarding
      navigate('/paywall');
    }
  };

  const handleSkip = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
    navigate('/paywall');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Skip */}
      <div className="flex justify-between items-center p-6">
        <div className="w-20"></div>
        {currentSlide < slides.length - 1 && (
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
              backgroundColor: slide.color,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {/* App Screenshot with Animation */}
        <div className="w-full max-w-[280px] mb-8 animate-fade-in">
          <div className="relative">
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-auto rounded-3xl shadow-2xl border-4 border-border animate-scale-in"
            />
            {/* Icon Overlay */}
            <div
              className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center shadow-xl animate-fade-in"
              style={{ backgroundColor: slide.color }}
            >
              <Icon size={40} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4 text-foreground animate-fade-in">
          {slide.title}
        </h1>

        <p className="text-center text-muted-foreground text-lg max-w-md leading-relaxed animate-fade-in">
          {slide.description}
        </p>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {slides.map((_, index) => (
          <div
            key={index}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: currentSlide === index ? '24px' : '8px',
              backgroundColor: currentSlide === index ? slide.color : '#e0e0e0',
            }}
          />
        ))}
      </div>

      {/* Continue Button */}
      <div className="px-6 pb-8">
        <Button
          onClick={handleNext}
          className="w-full text-white text-lg font-semibold py-7 rounded-2xl transition-all"
          style={{ backgroundColor: slide.color }}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
