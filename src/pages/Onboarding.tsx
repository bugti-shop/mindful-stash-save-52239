import { useState, useRef, TouchEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Wallet, TrendingUp, TrendingDown, Target, 
  User, Calendar, Clock, HelpCircle, 
  Briefcase, GraduationCap, Home as HomeIcon,
  BarChart, Bell, Check, ChevronLeft,
  PiggyBank, CreditCard, Shield, Zap,
  Plus, Upload
} from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { hapticFeedback } from '@/lib/haptics';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';

const ONBOARDING_COLOR = '#008568';

interface Jar {
  id: number;
  name: string;
  target: number;
  saved: number;
  streak: number;
  withdrawn: number;
  currency?: string;
  jarType?: 'flask' | 'circular';
  imageUrl?: string;
  purposeType?: 'saving' | 'debt';
  createdAt?: string;
}

const slides = [
  // Screen 1: Welcome & Name
  {
    id: 'welcome',
    type: 'input',
    title: "Let's get started!",
    subtitle: "What's your name?",
    icon: User,
    inputType: 'text',
    inputPlaceholder: 'Enter your name',
  },
  // Screen 2: Primary Goal
  {
    id: 'primary_goal',
    type: 'input',
    title: 'What are you saving for?',
    subtitle: 'Your primary goal',
    icon: Target,
    inputType: 'text',
    inputPlaceholder: 'e.g., New car, vacation, emergency fund',
  },
  // Screen 3: First Target Amount
  {
    id: 'target_amount',
    type: 'input',
    title: 'How much do you need?',
    subtitle: 'Target amount',
    icon: TrendingUp,
    inputType: 'number',
    inputPlaceholder: 'Enter target amount',
  },
  // Screen 4: Where did you hear about us
  {
    id: 'referral',
    type: 'social_select',
    title: 'Where did you hear about us?',
    icon: HelpCircle,
    options: [
      { text: 'TikTok', icon: '🎵', color: '#000000' },
      { text: 'Google', icon: '🔍', color: '#4285F4' },
      { text: 'YouTube', icon: '▶️', color: '#FF0000' },
      { text: 'Play Store', icon: '📱', color: '#01875f' },
      { text: 'Friends/Family', icon: '👥', color: '#6B7280' },
    ],
  },
  // Screen 5: Q1 - Main Financial Goal
  {
    id: 'financial_goal',
    type: 'options',
    title: "What's your main financial goal?",
    icon: Target,
    options: [
      { text: 'Save for something specific', emoji: '💰' },
      { text: 'Pay off debt', emoji: '📉' },
      { text: 'Build an emergency fund', emoji: '💪' },
      { text: 'All of the above', emoji: '🎯' },
    ],
  },
  // Screen 6: Q2 - Describe Yourself
  {
    id: 'user_type',
    type: 'options',
    title: 'How would you describe yourself?',
    icon: User,
    options: [
      { text: 'Student managing allowance', emoji: '🎓' },
      { text: 'Freelancer with irregular income', emoji: '💼' },
      { text: 'Working professional', emoji: '👔' },
      { text: 'Managing household finances', emoji: '🏠' },
    ],
  },
  // Screen 7: Q3 - Track Progress
  {
    id: 'tracking_preference',
    type: 'options',
    title: 'How do you prefer to track progress?',
    icon: BarChart,
    options: [
      { text: 'Daily check-ins', emoji: '📅' },
      { text: 'Weekly reviews', emoji: '📊' },
      { text: 'Monthly summaries', emoji: '📆' },
      { text: 'Just remind me when needed', emoji: '🔔' },
    ],
  },
  // Screen 8: Q4 - Biggest Challenge
  {
    id: 'challenge',
    type: 'options',
    title: "What's your biggest challenge?",
    icon: TrendingDown,
    options: [
      { text: 'I forget to track expenses', emoji: '😅' },
      { text: "I don't know where my money goes", emoji: '🤔' },
      { text: 'Debt feels overwhelming', emoji: '😰' },
      { text: 'Hard to stay motivated', emoji: '🎯' },
    ],
  },
  // Screen 9: Educational - Problem
  {
    id: 'education_1',
    type: 'education',
    title: "Most people struggle because they don't see daily progress",
    subtitle: "But you're about to change that",
    icon: TrendingDown,
    animation: 'stressed',
  },
  // Screen 10: Educational - Solution
  {
    id: 'education_2',
    type: 'education',
    title: 'Track everything in one beautiful place',
    subtitle: 'Daily, weekly, or monthly',
    icon: Check,
    animation: 'happy',
  },
  // Screen 11: Tutorial - Create Jar (Step 1)
  {
    id: 'tutorial_create_jar',
    type: 'tutorial_jar',
    title: 'Create Your First Jar',
    subtitle: "Let's set up your first savings goal",
    icon: PiggyBank,
  },
  // Screen 12: Tutorial - Add Transaction
  {
    id: 'tutorial_add_money',
    type: 'tutorial_transaction',
    title: 'Add Your First Transaction',
    subtitle: 'Every dollar counts',
    icon: Plus,
  },
  // Screen 13-24: Dark Mode Selection (12 modes)
  {
    id: 'theme_selection',
    type: 'theme_select',
    title: 'Choose your preferred theme',
    subtitle: 'You can change this anytime',
    icon: Wallet,
  },
  // Screen 25: Notification Permission
  {
    id: 'notifications',
    type: 'permission',
    title: 'Stay on track with reminders',
    subtitle: 'Get notifications for your savings goals',
    icon: Bell,
  },
  // Screen 26: Final
  {
    id: 'complete',
    type: 'complete',
    title: "You're all set!",
    subtitle: 'Start your savings journey now',
    icon: Zap,
  },
];

const themes = [
  { id: 'light', name: 'Light Mode', preview: 'bg-white', isPremium: false },
  { id: 'dark', name: 'Default Dark', preview: 'bg-gray-900', isPremium: false },
  { id: 'ocean', name: 'Ocean Blue', preview: 'bg-gradient-to-br from-blue-900 to-cyan-700', isPremium: true },
  { id: 'forest', name: 'Forest Green', preview: 'bg-gradient-to-br from-green-900 to-emerald-700', isPremium: true },
  { id: 'sunset', name: 'Sunset Orange', preview: 'bg-gradient-to-br from-orange-900 to-rose-700', isPremium: true },
  { id: 'rose', name: 'Rose Gold', preview: 'bg-gradient-to-br from-rose-900 to-pink-700', isPremium: true },
  { id: 'midnight', name: 'Midnight Purple', preview: 'bg-gradient-to-br from-purple-900 to-indigo-700', isPremium: true },
  { id: 'minimal', name: 'Minimal Gray', preview: 'bg-gradient-to-br from-gray-800 to-slate-700', isPremium: true },
  { id: 'nebula', name: 'Nebula', preview: 'bg-gradient-to-br from-purple-950 to-pink-800', isPremium: true },
  { id: 'obsidian', name: 'Obsidian', preview: 'bg-gradient-to-br from-slate-950 to-blue-950', isPremium: true },
  { id: 'graphite', name: 'Graphite', preview: 'bg-gradient-to-br from-slate-900 to-slate-700', isPremium: true },
  { id: 'onyx', name: 'Onyx', preview: 'bg-gradient-to-br from-black to-gray-900', isPremium: true },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [tempInput, setTempInput] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [tutorialJar, setTutorialJar] = useState<Partial<Jar> | null>(null);
  const [showJarForm, setShowJarForm] = useState(false);
  const [jarFormData, setJarFormData] = useState({ name: '', target: '', currency: '$' });
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress) {
      const { currentSlide: savedSlide, responses: savedResponses } = JSON.parse(savedProgress);
      setCurrentSlide(savedSlide);
      setResponses(savedResponses);
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (currentSlide > 0) {
      localStorage.setItem('onboarding_progress', JSON.stringify({
        currentSlide,
        responses,
      }));
    }
  }, [currentSlide, responses]);

  const handleResponse = async (slideId: string, value: any) => {
    await hapticFeedback.light();
    setResponses(prev => ({ ...prev, [slideId]: value }));
  };

  const canContinue = () => {
    const slide = slides[currentSlide];
    if (slide.type === 'input') {
      return tempInput.trim() !== '';
    }
    if (slide.type === 'options' || slide.type === 'social_select') {
      return responses[slide.id] !== undefined;
    }
    if (slide.type === 'tutorial_jar') {
      return tutorialJar !== null;
    }
    if (slide.type === 'tutorial_transaction') {
      return tutorialJar && tutorialJar.saved && tutorialJar.saved > 0;
    }
    return true;
  };

  const handleNext = async () => {
    await hapticFeedback.medium();
    const slide = slides[currentSlide];
    
    if (slide.type === 'input') {
      setResponses(prev => ({ ...prev, [slide.id]: tempInput }));
      setTempInput('');
    }

    if (currentSlide < slides.length - 1) {
      setSlideDirection('right');
      setCurrentSlide(currentSlide + 1);
    } else {
      // Complete onboarding
      if (tutorialJar) {
        const jars = storage.loadJars();
        storage.saveJars([...jars, {
          ...tutorialJar,
          id: Date.now(),
          streak: 0,
          withdrawn: 0,
          createdAt: new Date().toISOString(),
        } as Jar]);
      }
      
      localStorage.removeItem('onboarding_progress');
      completeOnboarding();
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
      if (swipeDistance > 0 && currentSlide < slides.length - 1 && canContinue()) {
        await handleNext();
      } else if (swipeDistance < 0 && currentSlide > 0) {
        await handlePrevious();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'ocean', 'forest', 'sunset', 'rose', 'midnight', 'minimal', 'nebula', 'obsidian', 'graphite', 'onyx', 'charcoal');
    root.classList.add(themeId);
    localStorage.setItem('app_theme', themeId);
    handleResponse('theme_selection', themeId);
  };

  const handleCreateTutorialJar = () => {
    if (!jarFormData.name || !jarFormData.target) {
      toast({
        title: "Missing information",
        description: "Please fill in both name and target amount",
        variant: "destructive",
      });
      return;
    }

    const newJar: Partial<Jar> = {
      name: jarFormData.name,
      target: parseFloat(jarFormData.target),
      saved: 0,
      currency: jarFormData.currency,
      jarType: 'flask',
      purposeType: 'saving',
    };

    setTutorialJar(newJar);
    setShowJarForm(false);
    toast({
      title: "Jar created!",
      description: "Now let's add your first transaction",
    });
  };

  const handleAddMoney = () => {
    if (!tutorialJar) return;
    
    const amount = 100; // Default amount for tutorial
    setTutorialJar(prev => ({
      ...prev,
      saved: (prev?.saved || 0) + amount,
    }));
    
    toast({
      title: "Money added!",
      description: `Added ${jarFormData.currency}${amount} to your jar`,
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      handleResponse('notifications', permission === 'granted');
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll receive reminders for your savings goals",
        });
      }
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const renderSlideContent = () => {
    switch (slide.type) {
      case 'input':
        return (
          <div className="w-full max-w-md space-y-6 animate-fade-in px-4">
            <Input
              type={slide.inputType}
              placeholder={slide.inputPlaceholder}
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              className="text-lg p-6 border-2"
              style={{ borderColor: ONBOARDING_COLOR }}
              autoFocus
            />
          </div>
        );

      case 'options':
        return (
          <div className="w-full max-w-md space-y-4 animate-fade-in px-4">
            {slide.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(slide.id, option.text)}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                className="w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left flex items-center gap-4 hover:scale-[1.02]"
                style={{
                  borderColor: responses[slide.id] === option.text ? ONBOARDING_COLOR : '#e0e0e0',
                  backgroundColor: responses[slide.id] === option.text ? ONBOARDING_COLOR : 'transparent',
                }}
              >
                <span className="text-3xl flex-shrink-0">{option.emoji}</span>
                <span 
                  className="font-medium text-base flex-1"
                  style={{
                    color: responses[slide.id] === option.text ? '#ffffff' : 'hsl(var(--foreground))',
                  }}
                >
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        );

      case 'social_select':
        return (
          <div className="w-full max-w-md space-y-4 animate-fade-in px-4">
            {slide.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(slide.id, option.text)}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                className="w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left flex items-center gap-4 hover:scale-[1.02]"
                style={{
                  borderColor: responses[slide.id] === option.text ? ONBOARDING_COLOR : '#e0e0e0',
                  backgroundColor: responses[slide.id] === option.text ? ONBOARDING_COLOR : 'transparent',
                }}
              >
                <span className="text-3xl flex-shrink-0">{option.icon}</span>
                <span 
                  className="font-medium text-base flex-1"
                  style={{
                    color: responses[slide.id] === option.text ? '#ffffff' : 'hsl(var(--foreground))',
                  }}
                >
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        );

      case 'education':
        return (
          <div className="w-full max-w-md space-y-6 animate-fade-in px-4 text-center">
            <div className="text-6xl mb-4">
              {slide.animation === 'stressed' ? '😰' : '✨'}
            </div>
            <p className="text-muted-foreground text-lg">{slide.subtitle}</p>
          </div>
        );

      case 'tutorial_jar':
        if (!showJarForm && !tutorialJar) {
          return (
            <div className="w-full max-w-md space-y-6 animate-fade-in px-4">
              <Button
                onClick={() => setShowJarForm(true)}
                className="w-full text-white text-lg py-6"
                style={{ backgroundColor: ONBOARDING_COLOR }}
              >
                <Plus className="mr-2" /> Create Your First Jar
              </Button>
            </div>
          );
        }

        if (showJarForm && !tutorialJar) {
          return (
            <div className="w-full max-w-md space-y-4 animate-fade-in px-4">
              <Input
                placeholder="Jar name (e.g., Vacation Fund)"
                value={jarFormData.name}
                onChange={(e) => setJarFormData(prev => ({ ...prev, name: e.target.value }))}
                className="text-lg p-6 border-2"
                style={{ borderColor: ONBOARDING_COLOR }}
              />
              <Input
                type="number"
                placeholder="Target amount"
                value={jarFormData.target}
                onChange={(e) => setJarFormData(prev => ({ ...prev, target: e.target.value }))}
                className="text-lg p-6 border-2"
                style={{ borderColor: ONBOARDING_COLOR }}
              />
              <Button
                onClick={handleCreateTutorialJar}
                className="w-full text-white text-lg py-6"
                style={{ backgroundColor: ONBOARDING_COLOR }}
              >
                Create Jar
              </Button>
            </div>
          );
        }

        if (tutorialJar) {
          return (
            <div className="w-full max-w-md space-y-4 animate-fade-in px-4">
              <div className="bg-card p-6 rounded-2xl border-2" style={{ borderColor: ONBOARDING_COLOR }}>
                <h3 className="font-bold text-xl mb-2">{tutorialJar.name}</h3>
                <p className="text-muted-foreground">Target: {jarFormData.currency}{tutorialJar.target}</p>
                <p className="text-muted-foreground">Saved: {jarFormData.currency}{tutorialJar.saved || 0}</p>
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${((tutorialJar.saved || 0) / (tutorialJar.target || 1)) * 100}%`,
                      backgroundColor: ONBOARDING_COLOR,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        }
        return null;

      case 'tutorial_transaction':
        return (
          <div className="w-full max-w-md space-y-6 animate-fade-in px-4">
            {tutorialJar && (
              <>
                <div className="bg-card p-6 rounded-2xl border-2" style={{ borderColor: ONBOARDING_COLOR }}>
                  <h3 className="font-bold text-xl mb-2">{tutorialJar.name}</h3>
                  <p className="text-2xl font-bold mb-4" style={{ color: ONBOARDING_COLOR }}>
                    {jarFormData.currency}{tutorialJar.saved || 0}
                  </p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${((tutorialJar.saved || 0) / (tutorialJar.target || 1)) * 100}%`,
                        backgroundColor: ONBOARDING_COLOR,
                      }}
                    />
                  </div>
                </div>
                {(!tutorialJar.saved || tutorialJar.saved === 0) && (
                  <Button
                    onClick={handleAddMoney}
                    className="w-full text-white text-lg py-6"
                    style={{ backgroundColor: ONBOARDING_COLOR }}
                  >
                    Add {jarFormData.currency}100
                  </Button>
                )}
              </>
            )}
          </div>
        );

      case 'theme_select':
        return (
          <div className="w-full max-w-md space-y-4 animate-fade-in px-4">
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="relative rounded-2xl border-2 p-4 transition-all"
                  style={{
                    borderColor: selectedTheme === theme.id ? ONBOARDING_COLOR : '#e0e0e0',
                  }}
                >
                  <div className={`h-20 rounded-lg mb-2 ${theme.preview}`} />
                  <p className="text-sm font-medium text-center">{theme.name}</p>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: ONBOARDING_COLOR }}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'permission':
        return (
          <div className="w-full max-w-md space-y-6 animate-fade-in px-4 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <Button
              onClick={requestNotificationPermission}
              className="w-full text-white text-lg py-6"
              style={{ backgroundColor: ONBOARDING_COLOR }}
            >
              Enable Notifications
            </Button>
            <button
              onClick={() => handleResponse('notifications', false)}
              className="text-muted-foreground text-sm"
            >
              Skip for now
            </button>
          </div>
        );

      case 'complete':
        return (
          <div className="w-full max-w-md space-y-6 animate-fade-in px-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-muted-foreground text-lg">{slide.subtitle}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen bg-background flex flex-col overflow-hidden pb-0"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with Back Button */}
      <div className="flex justify-between items-center p-4">
        {currentSlide > 0 && (
          <Button
            variant="ghost"
            onClick={handlePrevious}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1"></div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-4">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
              backgroundColor: ONBOARDING_COLOR,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div 
        key={currentSlide}
        className={`flex-1 flex flex-col items-center justify-start px-6 pt-8 ${
          slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
        }`}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-fade-in"
          style={{ backgroundColor: ONBOARDING_COLOR }}
        >
          <Icon size={32} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-3 text-foreground animate-fade-in px-4">
          {slide.title}
        </h1>

        {slide.subtitle && (
          <p className="text-muted-foreground text-center mb-8 animate-fade-in px-4">
            {slide.subtitle}
          </p>
        )}

        {/* Slide Content */}
        <div className="w-full flex-1 flex flex-col items-center">
          {renderSlideContent()}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mb-4 px-6">
        {slides.map((_, index) => (
          <div
            key={index}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: currentSlide === index ? '24px' : '8px',
              backgroundColor: currentSlide === index ? ONBOARDING_COLOR : '#e0e0e0',
            }}
          />
        ))}
      </div>

      {/* Continue Button */}
      <div className="px-6 pb-6">
        <Button
          onClick={handleNext}
          disabled={!canContinue()}
          className="w-full text-white text-base font-semibold py-6 rounded-2xl transition-all disabled:opacity-50"
          style={{ backgroundColor: ONBOARDING_COLOR }}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
