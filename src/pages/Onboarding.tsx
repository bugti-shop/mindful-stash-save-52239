import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Shield, Bell, ChartBar } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

const slides = [
  {
    icon: Wallet,
    title: 'Organize Your Savings',
    description: 'Create unlimited jars to organize your savings goals. Track each goal separately and watch your progress grow.',
    color: '#3c78f0',
  },
  {
    icon: TrendingUp,
    title: 'Track Your Progress',
    description: 'Visual charts and insights help you understand your saving patterns. See exactly where your money goes.',
    color: '#3c78f0',
  },
  {
    icon: Shield,
    title: 'Secure Backup & Sync',
    description: 'Your data is automatically backed up and synced across all your devices. Never lose your financial records.',
    color: '#3c78f0',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Set custom reminders for your savings goals. Stay on track with personalized notifications.',
    color: '#3c78f0',
  },
  {
    icon: ChartBar,
    title: 'Advanced Analytics',
    description: 'Get detailed insights into your savings trends. Make smarter financial decisions with data-driven analytics.',
    color: '#3c78f0',
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Navigate to paywall after onboarding
      navigate('/paywall');
    }
  };

  const handleSkip = () => {
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
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-300"
          style={{ backgroundColor: `${slide.color}15` }}
        >
          <Icon size={64} style={{ color: slide.color }} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-4 text-foreground">
          {slide.title}
        </h1>

        <p className="text-center text-muted-foreground text-lg max-w-md leading-relaxed">
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
