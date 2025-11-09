import { useState, useRef, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Users, Target, TrendingDown } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { hapticFeedback } from '@/lib/haptics';

const slides = [
  {
    icon: Wallet,
    title: 'What is your main savings goal?',
    options: ['Emergency Fund', 'Vacation', 'New Car', 'Home Down Payment'],
    color: '#3c78f0',
  },
  {
    icon: TrendingUp,
    title: 'How much do you want to save monthly?',
    options: ['$100 - $300', '$300 - $500', '$500 - $1000', 'More than $1000'],
    color: '#3c78f0',
  },
  {
    icon: Users,
    title: 'Are you saving alone or with others?',
    options: ['Just me', 'With partner', 'With family', 'With friends'],
    color: '#3c78f0',
  },
  {
    icon: Target,
    title: 'What is your biggest savings challenge?',
    options: ['Staying consistent', 'Tracking expenses', 'Avoiding impulse buys', 'Setting realistic goals'],
    color: '#3c78f0',
  },
  {
    icon: TrendingDown,
    title: 'How often do you check your savings?',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    color: '#3c78f0',
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(new Array(slides.length).fill(''));
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();

  const handleOptionSelect = async (option: string) => {
    await hapticFeedback.light();
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentSlide] = option;
    setSelectedOptions(newSelectedOptions);
  };

  const handleNext = async () => {
    await hapticFeedback.medium();
    if (currentSlide < slides.length - 1) {
      setSlideDirection('right');
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/paywall');
    }
  };

  const handlePrevious = async () => {
    await hapticFeedback.light();
    if (currentSlide > 0) {
      setSlideDirection('left');
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = async () => {
    await hapticFeedback.light();
    navigate('/paywall');
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = async () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && currentSlide < slides.length - 1) {
        // Swipe left - next slide
        await hapticFeedback.light();
        setSlideDirection('right');
        setCurrentSlide(currentSlide + 1);
      } else if (swipeDistance < 0 && currentSlide > 0) {
        // Swipe right - previous slide
        await hapticFeedback.light();
        setSlideDirection('left');
        setCurrentSlide(currentSlide - 1);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div 
      className="h-screen bg-background flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with Skip */}
      <div className="flex justify-between items-center p-4">
        <div className="w-16"></div>
        {currentSlide < slides.length - 1 && (
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Skip
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-4">
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

      {/* Content with slide animation */}
      <div 
        key={currentSlide}
        className={`flex-1 flex flex-col items-center justify-center px-6 ${
          slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
        }`}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-fade-in"
          style={{ backgroundColor: slide.color }}
        >
          <Icon size={32} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-8 text-foreground animate-fade-in px-4">
          {slide.title}
        </h1>

        {/* Options */}
        <div className="w-full max-w-md space-y-3 animate-fade-in">
          {slide.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className="w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between"
              style={{
                borderColor: selectedOptions[currentSlide] === option ? slide.color : '#e0e0e0',
                backgroundColor: selectedOptions[currentSlide] === option ? `${slide.color}10` : 'transparent',
              }}
            >
              <span className="text-foreground font-medium">{option}</span>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: selectedOptions[currentSlide] === option ? slide.color : '#e0e0e0',
                  backgroundColor: selectedOptions[currentSlide] === option ? slide.color : 'transparent',
                }}
              >
                {selectedOptions[currentSlide] === option && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mb-4">
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
      <div className="px-6 pb-6">
        <Button
          onClick={handleNext}
          disabled={!selectedOptions[currentSlide]}
          className="w-full text-white text-base font-semibold py-6 rounded-2xl transition-all disabled:opacity-50"
          style={{ backgroundColor: slide.color }}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
