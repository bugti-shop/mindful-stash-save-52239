import { useState, useRef, TouchEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, Target, TrendingUp, HelpCircle, BarChart, 
  ChevronLeft, Check, Bell, Upload, Plus
} from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { hapticFeedback } from '@/lib/haptics';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import SavingsButton from '@/components/SavingsButton';
import CircularJarVisualization from '@/components/CircularJarVisualization';
import JarVisualization from '@/components/JarVisualization';

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
  categoryId?: number;
}

const socialLogos: Record<string, string> = {
  TikTok: '🎵',
  Google: '🔍',
  YouTube: '▶️',
  'Play Store': '📱',
  'Friends/Family': '👥',
};

const themes = [
  { id: 'light', name: 'Light', preview: 'bg-white border-2 border-gray-200' },
  { id: 'dark', name: 'Dark', preview: 'bg-gray-900' },
  { id: 'ocean', name: 'Ocean', preview: 'bg-gradient-to-br from-blue-900 to-cyan-700' },
  { id: 'forest', name: 'Forest', preview: 'bg-gradient-to-br from-green-900 to-emerald-700' },
  { id: 'sunset', name: 'Sunset', preview: 'bg-gradient-to-br from-orange-900 to-rose-700' },
  { id: 'rose', name: 'Rose', preview: 'bg-gradient-to-br from-rose-900 to-pink-700' },
  { id: 'midnight', name: 'Midnight', preview: 'bg-gradient-to-br from-purple-900 to-indigo-700' },
  { id: 'minimal', name: 'Minimal', preview: 'bg-gradient-to-br from-gray-800 to-slate-700' },
  { id: 'nebula', name: 'Nebula', preview: 'bg-gradient-to-br from-purple-950 to-pink-800' },
  { id: 'obsidian', name: 'Obsidian', preview: 'bg-gradient-to-br from-slate-950 to-blue-950' },
  { id: 'graphite', name: 'Graphite', preview: 'bg-gradient-to-br from-slate-900 to-slate-700' },
  { id: 'onyx', name: 'Onyx', preview: 'bg-gradient-to-br from-black to-gray-900' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [userName, setUserName] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [source, setSource] = useState('');
  const [financialGoal, setFinancialGoal] = useState('');
  const [userType, setUserType] = useState('');
  const [trackingPref, setTrackingPref] = useState('');
  const [challenge, setChallenge] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('light');
  
  // Tutorial jar states
  const [tutorialJar, setTutorialJar] = useState<Partial<Jar> | null>(null);
  const [jarName, setJarName] = useState('');
  const [jarTarget, setJarTarget] = useState('');
  const [jarType, setJarType] = useState<'flask' | 'circular'>('flask');
  const [jarImage, setJarImage] = useState('');
  const [currency, setCurrency] = useState('$');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const { toast } = useToast();

  // Save progress
  useEffect(() => {
    if (step > 0) {
      localStorage.setItem('onboarding_step', step.toString());
    }
  }, [step]);

  // Load progress
  useEffect(() => {
    const savedStep = localStorage.getItem('onboarding_step');
    if (savedStep) {
      setStep(parseInt(savedStep));
    }
  }, []);

  const handleNext = async () => {
    await hapticFeedback.medium();
    setDirection('forward');
    setStep(step + 1);
  };

  const handleBack = async () => {
    if (step > 0) {
      await hapticFeedback.light();
      setDirection('backward');
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    await hapticFeedback.success();
    
    // Save tutorial jar if created
    if (tutorialJar && tutorialJar.name && tutorialJar.target) {
      const jars = storage.loadJars();
      const categories = storage.loadCategories();
      storage.saveJars([...jars, {
        ...tutorialJar,
        id: Date.now(),
        streak: 0,
        withdrawn: 0,
        createdAt: new Date().toISOString(),
        categoryId: categories[0]?.id || 1,
      } as Jar]);
    }
    
    localStorage.removeItem('onboarding_step');
    completeOnboarding();
    navigate('/paywall');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setJarImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateJar = () => {
    if (!jarName || !jarTarget) {
      toast({
        title: "Missing information",
        description: "Please enter jar name and target amount",
        variant: "destructive",
      });
      return;
    }

    const newJar: Partial<Jar> = {
      name: jarName,
      target: parseFloat(jarTarget),
      saved: 0,
      jarType,
      imageUrl: jarImage || undefined,
      currency,
      purposeType: 'saving',
    };

    setTutorialJar(newJar);
    toast({
      title: "Jar created! 🎉",
      description: "Now let's add your first transaction",
    });
  };

  const handleAddMoney = () => {
    if (!tutorialJar) return;
    
    const amount = 100;
    setTutorialJar({
      ...tutorialJar,
      saved: (tutorialJar.saved || 0) + amount,
    });
    
    toast({
      title: "Money added! 💰",
      description: `Added ${currency}${amount} to your jar`,
    });
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const root = document.documentElement;
    themes.forEach(t => root.classList.remove(t.id));
    root.classList.add(themeId);
    localStorage.setItem('app_theme', themeId);
  };

  const requestNotifications = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
    await handleNext();
  };

  const canContinue = () => {
    switch (step) {
      case 0: return userName.trim() !== '';
      case 1: return userGoal.trim() !== '';
      case 2: return targetAmount.trim() !== '';
      case 3: return source !== '';
      case 4: return financialGoal !== '';
      case 5: return userType !== '';
      case 6: return trackingPref !== '';
      case 7: return challenge !== '';
      case 8: return true; // Education 1
      case 9: return true; // Education 2
      case 10: return tutorialJar !== null; // Jar created
      case 11: return tutorialJar && tutorialJar.saved && tutorialJar.saved > 0; // Money added
      case 12: return true; // Theme selection
      case 13: return true; // Notifications
      default: return true;
    }
  };

  // Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = async () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0 && canContinue()) {
        await handleNext();
      } else if (swipeDistance < 0 && step > 0) {
        await handleBack();
      }
    }
  };

  const renderStep = () => {
    const animationClass = direction === 'forward' 
      ? 'animate-slide-in-right' 
      : 'animate-slide-in-left';

    switch (step) {
      case 0: // Name
        return (
          <div key={step} className={`flex-1 flex flex-col items-center justify-center px-6 ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <User size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-4 text-foreground">Let's get started!</h1>
            <p className="text-muted-foreground text-center mb-8">What's your name?</p>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="max-w-md text-lg p-6 border-2"
              style={{ borderColor: ONBOARDING_COLOR }}
            />
          </div>
        );

      case 1: // Goal
        return (
          <div key={step} className={`flex-1 flex flex-col items-center justify-center px-6 ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <Target size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-4 text-foreground">What are you saving for?</h1>
            <p className="text-muted-foreground text-center mb-8">Your primary goal</p>
            <Input
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="e.g., New car, vacation"
              className="max-w-md text-lg p-6 border-2"
              style={{ borderColor: ONBOARDING_COLOR }}
            />
          </div>
        );

      case 2: // Amount
        return (
          <div key={step} className={`flex-1 flex flex-col items-center justify-center px-6 ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <TrendingUp size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-4 text-foreground">How much do you need?</h1>
            <p className="text-muted-foreground text-center mb-8">Target amount</p>
            <Input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Enter target amount"
              className="max-w-md text-lg p-6 border-2"
              style={{ borderColor: ONBOARDING_COLOR }}
            />
          </div>
        );

      case 3: // Source
        return (
          <div key={step} className={`flex-1 flex flex-col items-center px-6 pt-12 ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <HelpCircle size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-12 text-foreground">Where did you hear about us?</h1>
            <div className="w-full max-w-md space-y-4">
              {Object.entries(socialLogos).map(([name, emoji]) => (
                <button
                  key={name}
                  onClick={() => setSource(name)}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 hover:scale-[1.02]"
                  style={{
                    borderColor: source === name ? ONBOARDING_COLOR : '#e0e0e0',
                    backgroundColor: source === name ? ONBOARDING_COLOR : 'transparent',
                  }}
                >
                  <span className="text-4xl">{emoji}</span>
                  <span 
                    className="text-lg font-medium"
                    style={{ color: source === name ? '#ffffff' : 'hsl(var(--foreground))' }}
                  >
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // Q1
        return (
          <div key={step} className={`flex-1 flex flex-col items-center px-6 pt-12 ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <Target size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-12 text-foreground">What's your main financial goal?</h1>
            <div className="w-full max-w-md space-y-4">
              {[
                { text: 'Save for something specific', emoji: '💰' },
                { text: 'Pay off debt', emoji: '📉' },
                { text: 'Build an emergency fund', emoji: '💪' },
                { text: 'All of the above', emoji: '🎯' },
              ].map((option) => (
                <button
                  key={option.text}
                  onClick={() => setFinancialGoal(option.text)}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 hover:scale-[1.02]"
                  style={{
                    borderColor: financialGoal === option.text ? ONBOARDING_COLOR : '#e0e0e0',
                    backgroundColor: financialGoal === option.text ? ONBOARDING_COLOR : 'transparent',
                  }}
                >
                  <span className="text-4xl">{option.emoji}</span>
                  <span 
                    className="text-lg font-medium"
                    style={{ color: financialGoal === option.text ? '#ffffff' : 'hsl(var(--foreground))' }}
                  >
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5: // Q2
        return (
          <div key={step} className={`flex-1 flex flex-col items-center px-6 pt-12 ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <User size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-12 text-foreground">How would you describe yourself?</h1>
            <div className="w-full max-w-md space-y-4">
              {[
                { text: 'Student managing allowance', emoji: '🎓' },
                { text: 'Freelancer with irregular income', emoji: '💼' },
                { text: 'Working professional', emoji: '👔' },
                { text: 'Managing household finances', emoji: '🏠' },
              ].map((option) => (
                <button
                  key={option.text}
                  onClick={() => setUserType(option.text)}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 hover:scale-[1.02]"
                  style={{
                    borderColor: userType === option.text ? ONBOARDING_COLOR : '#e0e0e0',
                    backgroundColor: userType === option.text ? ONBOARDING_COLOR : 'transparent',
                  }}
                >
                  <span className="text-4xl">{option.emoji}</span>
                  <span 
                    className="text-lg font-medium"
                    style={{ color: userType === option.text ? '#ffffff' : 'hsl(var(--foreground))' }}
                  >
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 6: // Q3
        return (
          <div key={step} className={`flex-1 flex flex-col items-center px-6 pt-12 ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <BarChart size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-12 text-foreground">How do you prefer to track progress?</h1>
            <div className="w-full max-w-md space-y-4">
              {[
                { text: 'Daily check-ins', emoji: '📅' },
                { text: 'Weekly reviews', emoji: '📊' },
                { text: 'Monthly summaries', emoji: '📆' },
                { text: 'Just remind me when needed', emoji: '🔔' },
              ].map((option) => (
                <button
                  key={option.text}
                  onClick={() => setTrackingPref(option.text)}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 hover:scale-[1.02]"
                  style={{
                    borderColor: trackingPref === option.text ? ONBOARDING_COLOR : '#e0e0e0',
                    backgroundColor: trackingPref === option.text ? ONBOARDING_COLOR : 'transparent',
                  }}
                >
                  <span className="text-4xl">{option.emoji}</span>
                  <span 
                    className="text-lg font-medium"
                    style={{ color: trackingPref === option.text ? '#ffffff' : 'hsl(var(--foreground))' }}
                  >
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 7: // Q4
        return (
          <div key={step} className={`flex-1 flex flex-col items-center px-6 pt-12 ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <Target size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-12 text-foreground">What's your biggest challenge?</h1>
            <div className="w-full max-w-md space-y-4">
              {[
                { text: 'I forget to track expenses', emoji: '😅' },
                { text: "I don't know where my money goes", emoji: '🤔' },
                { text: 'Debt feels overwhelming', emoji: '😰' },
                { text: 'Hard to stay motivated', emoji: '🎯' },
              ].map((option) => (
                <button
                  key={option.text}
                  onClick={() => setChallenge(option.text)}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 hover:scale-[1.02]"
                  style={{
                    borderColor: challenge === option.text ? ONBOARDING_COLOR : '#e0e0e0',
                    backgroundColor: challenge === option.text ? ONBOARDING_COLOR : 'transparent',
                  }}
                >
                  <span className="text-4xl">{option.emoji}</span>
                  <span 
                    className="text-lg font-medium"
                    style={{ color: challenge === option.text ? '#ffffff' : 'hsl(var(--foreground))' }}
                  >
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 8: // Education 1
        return (
          <div key={step} className={`flex-1 flex flex-col items-center justify-center px-6 text-center ${animationClass}`}>
            <div className="text-8xl mb-8 animate-pulse">😰</div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Most people struggle because they don't see daily progress</h1>
            <p className="text-xl text-muted-foreground">But you're about to change that</p>
          </div>
        );

      case 9: // Education 2
        return (
          <div key={step} className={`flex-1 flex flex-col items-center justify-center px-6 text-center ${animationClass}`}>
            <div className="text-8xl mb-8 animate-bounce">✨</div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Track everything in one beautiful place</h1>
            <p className="text-xl text-muted-foreground">Daily, weekly, or monthly</p>
          </div>
        );

      case 10: // Create Jar Tutorial
        return (
          <div key={step} className={`flex-1 flex flex-col items-center px-6 pt-8 pb-4 overflow-y-auto ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <Plus size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-3 text-foreground">Create Your First Jar</h1>
            <p className="text-muted-foreground text-center mb-8">Set up your first savings goal</p>
            
            {!tutorialJar ? (
              <div className="w-full max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Choose Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setJarType('flask')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        jarType === 'flask' ? 'border-[#008568] bg-[#008568]/10' : 'border-gray-300'
                      }`}
                    >
                      <div className="h-20 flex items-center justify-center mb-2">
                        <JarVisualization progress={50} jarId={9999} isLarge={false} />
                      </div>
                      <p className="text-sm font-medium text-center">Classic Jar</p>
                    </button>
                    <button
                      onClick={() => setJarType('circular')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        jarType === 'circular' ? 'border-[#008568] bg-[#008568]/10' : 'border-gray-300'
                      }`}
                    >
                      <div className="h-20 flex items-center justify-center mb-2">
                        <CircularJarVisualization progress={50} jarId={9998} isLarge={false} />
                      </div>
                      <p className="text-sm font-medium text-center">Photo Circle</p>
                    </button>
                  </div>
                </div>

                {jarType === 'circular' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Image (Optional)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-[#008568] flex items-center justify-center gap-2"
                      >
                        <Upload size={18} />
                        {jarImage ? 'Change Image' : 'Choose Image'}
                      </button>
                      {jarImage && (
                        <button
                          onClick={() => setJarImage('')}
                          className="px-4 py-3 rounded-xl bg-red-500 text-white"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {jarImage && (
                      <div className="mt-3 flex justify-center">
                        <img src={jarImage} alt="Preview" className="w-24 h-24 object-cover rounded-full" />
                      </div>
                    )}
                  </div>
                )}

                <Input
                  placeholder="Jar name (e.g., Vacation Fund)"
                  value={jarName}
                  onChange={(e) => setJarName(e.target.value)}
                  className="text-lg p-6 border-2"
                  style={{ borderColor: ONBOARDING_COLOR }}
                />
                
                <Input
                  type="number"
                  placeholder="Target amount"
                  value={jarTarget}
                  onChange={(e) => setJarTarget(e.target.value)}
                  className="text-lg p-6 border-2"
                  style={{ borderColor: ONBOARDING_COLOR }}
                />

                <SavingsButton onClick={handleCreateJar} className="w-full">
                  Create Jar
                </SavingsButton>
              </div>
            ) : (
              <div className="w-full max-w-md">
                <div className="bg-card p-6 rounded-2xl border-2 mb-4" style={{ borderColor: ONBOARDING_COLOR }}>
                  <h3 className="font-bold text-2xl mb-2">{tutorialJar.name}</h3>
                  <div className="flex items-center justify-center my-6">
                    {jarType === 'circular' ? (
                      <CircularJarVisualization 
                        progress={((tutorialJar.saved || 0) / (tutorialJar.target || 1)) * 100} 
                        jarId={99999} 
                        isLarge={true}
                        imageUrl={jarImage}
                      />
                    ) : (
                      <JarVisualization 
                        progress={((tutorialJar.saved || 0) / (tutorialJar.target || 1)) * 100} 
                        jarId={99999} 
                        isLarge={true}
                      />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-1">Target: {currency}{tutorialJar.target}</p>
                  <p className="text-muted-foreground">Saved: {currency}{tutorialJar.saved || 0}</p>
                  <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${((tutorialJar.saved || 0) / (tutorialJar.target || 1)) * 100}%`,
                        backgroundColor: ONBOARDING_COLOR,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 11: // Add Transaction
        return (
          <div key={step} className={`flex-1 flex flex-col items-center justify-center px-6 ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <TrendingUp size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-3 text-foreground">Add Your First Transaction</h1>
            <p className="text-muted-foreground text-center mb-8">Every dollar counts</p>
            
            {tutorialJar && (
              <div className="w-full max-w-md">
                <div className="bg-card p-6 rounded-2xl border-2 mb-6" style={{ borderColor: ONBOARDING_COLOR }}>
                  <h3 className="font-bold text-xl mb-2">{tutorialJar.name}</h3>
                  <p className="text-3xl font-bold mb-4" style={{ color: ONBOARDING_COLOR }}>
                    {currency}{tutorialJar.saved || 0}
                  </p>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${((tutorialJar.saved || 0) / (tutorialJar.target || 1)) * 100}%`,
                        backgroundColor: ONBOARDING_COLOR,
                      }}
                    />
                  </div>
                </div>
                
                {(!tutorialJar.saved || tutorialJar.saved === 0) && (
                  <SavingsButton onClick={handleAddMoney} className="w-full text-lg py-6">
                    Add {currency}100
                  </SavingsButton>
                )}
                
                {tutorialJar.saved && tutorialJar.saved > 0 && (
                  <div className="text-center animate-bounce">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-lg font-semibold" style={{ color: ONBOARDING_COLOR }}>
                      Great job! You added your first savings!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 12: // Theme Selection
        return (
          <div key={step} className={`flex-1 flex flex-col items-center px-6 pt-8 pb-4 overflow-y-auto ${animationClass}`}>
            <h1 className="text-2xl font-bold text-center mb-3 text-foreground">Choose Your Theme</h1>
            <p className="text-muted-foreground text-center mb-8">Select your preferred color scheme</p>
            
            <div className="w-full max-w-md grid grid-cols-3 gap-3 mb-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="relative rounded-2xl border-2 p-3 transition-all"
                  style={{
                    borderColor: selectedTheme === theme.id ? ONBOARDING_COLOR : '#e0e0e0',
                  }}
                >
                  <div className={`h-24 rounded-xl mb-2 ${theme.preview}`} />
                  <p className="text-xs font-medium text-center">{theme.name}</p>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: ONBOARDING_COLOR }}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 13: // Notifications
        return (
          <div key={step} className={`flex-1 flex flex-col items-center justify-center px-6 text-center ${animationClass}`}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: ONBOARDING_COLOR }}>
              <Bell size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Stay on track with reminders</h1>
            <p className="text-lg text-muted-foreground mb-8">Get notifications for your savings goals</p>
            <div className="text-6xl mb-8">🔔</div>
            <div className="w-full max-w-md space-y-4">
              <Button
                onClick={requestNotifications}
                className="w-full text-white text-lg py-6"
                style={{ backgroundColor: ONBOARDING_COLOR }}
              >
                Enable Notifications
              </Button>
              <button
                onClick={handleNext}
                className="text-muted-foreground text-sm"
              >
                Skip for now
              </button>
            </div>
          </div>
        );

      case 14: // Complete
        return (
          <div key={step} className={`flex-1 flex flex-col items-center justify-center px-6 text-center ${animationClass}`}>
            <div className="text-8xl mb-8 animate-bounce">🎉</div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">You're all set!</h1>
            <p className="text-xl text-muted-foreground mb-8">Start your savings journey now</p>
          </div>
        );

      default:
        return null;
    }
  };

  const totalSteps = 15;

  return (
    <div 
      className="min-h-screen bg-background flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        {step > 0 && step < 14 && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        {(step === 0 || step === 14) && <div className="w-10"></div>}
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-4">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((step + 1) / totalSteps) * 100}%`,
              backgroundColor: ONBOARDING_COLOR,
            }}
          />
        </div>
      </div>

      {/* Content */}
      {renderStep()}

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mb-4 px-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: step === index ? '24px' : '8px',
              backgroundColor: step === index ? ONBOARDING_COLOR : '#e0e0e0',
            }}
          />
        ))}
      </div>

      {/* Continue Button */}
      <div className="px-6 pb-6">
        <Button
          onClick={step === 14 ? handleFinish : handleNext}
          disabled={!canContinue()}
          className="w-full text-white text-base font-semibold py-6 rounded-2xl disabled:opacity-50"
          style={{ backgroundColor: ONBOARDING_COLOR }}
        >
          {step === 14 ? 'Get Started' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
