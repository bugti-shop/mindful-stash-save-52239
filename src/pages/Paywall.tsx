import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Lock, Bell, Crown, ChevronLeft } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { hapticFeedback } from '@/lib/haptics';

type PricingPlan = 'monthly' | 'yearly';

const BRAND_COLOR = '#3c78f0';

export default function Paywall() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('yearly');
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const { purchaseMonthly, purchaseYearly, isLoading } = useSubscription();

  const features = [
    { icon: Check, title: 'Unlimited Jars', description: 'Create unlimited savings goals and categories' },
    { icon: Check, title: 'Advanced Analytics', description: 'Track your progress with detailed insights' },
    { icon: Check, title: 'Cloud Backup', description: 'Automatic sync across all devices' },
    { icon: Check, title: 'All Dark Modes', description: 'Access to 6 premium themes' },
    { icon: Check, title: 'Smart Reminders', description: 'Custom notifications for your goals' },
    { icon: Check, title: 'No Ads', description: 'Ad-free experience forever' },
  ];

  const handleStartTrial = async () => {
    await hapticFeedback.heavy();
    if (selectedPlan === 'monthly') {
      await purchaseMonthly();
    } else {
      await purchaseYearly();
    }
    completeOnboarding();
    navigate('/');
  };

  const handlePlanSelect = async (plan: PricingPlan) => {
    await hapticFeedback.light();
    setSelectedPlan(plan);
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-accent transition-colors"
        >
          <ChevronLeft className="text-foreground" size={20} />
        </button>
      </div>

      <div className="flex-1 px-4 pb-32 overflow-y-auto">
        {/* Trial Timeline */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-2 text-foreground leading-tight">
            Start your 3-day
            <br />
            FREE trial to
            <br />
            continue.
          </h1>

          <div className="mt-6 space-y-3">
            {[
              {
                icon: Lock,
                title: 'Today',
                description: 'Unlock all the app\'s features',
                active: true,
              },
              {
                icon: Bell,
                title: 'In 2 Days - Reminder',
                description: 'We\'ll send you a reminder',
                active: true,
              },
              {
                icon: Crown,
                title: 'In 3 Days - Billing Starts',
                description: `You'll be charged unless you cancel before`,
                active: false,
              },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: item.active ? BRAND_COLOR : '#e0e0e0',
                  }}
                >
                  <item.icon size={20} className="text-white" />
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="font-bold text-foreground text-sm mb-0.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards - Side by Side */}
        <div className="flex gap-2 mb-6">
          {/* Monthly Plan */}
          <button
            onClick={() => handlePlanSelect('monthly')}
            className="flex-1 p-3 rounded-xl border-2 transition-all"
            style={{
              borderColor: selectedPlan === 'monthly' ? BRAND_COLOR : '#e0e0e0',
              backgroundColor: selectedPlan === 'monthly' ? `${BRAND_COLOR}10` : 'transparent',
            }}
          >
            <p className="text-xs text-muted-foreground mb-1">Monthly</p>
            <p className="text-xl font-bold text-foreground">$3.99<span className="text-xs font-normal">/mo</span></p>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto mt-2"
              style={{
                borderColor: selectedPlan === 'monthly' ? BRAND_COLOR : '#e0e0e0',
                backgroundColor: selectedPlan === 'monthly' ? BRAND_COLOR : 'transparent',
              }}
            >
              {selectedPlan === 'monthly' && <Check size={12} className="text-white" />}
            </div>
          </button>

          {/* Yearly Plan */}
          <button
            onClick={() => handlePlanSelect('yearly')}
            className="flex-1 p-3 rounded-xl border-2 transition-all relative"
            style={{
              borderColor: selectedPlan === 'yearly' ? BRAND_COLOR : '#e0e0e0',
              backgroundColor: selectedPlan === 'yearly' ? `${BRAND_COLOR}10` : 'transparent',
            }}
          >
            {selectedPlan === 'yearly' && (
              <div
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                3 DAYS FREE
              </div>
            )}
            <p className="text-xs text-muted-foreground mb-1">Yearly</p>
            <p className="text-xl font-bold text-foreground">$2.35<span className="text-xs font-normal">/mo</span></p>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto mt-2"
              style={{
                borderColor: selectedPlan === 'yearly' ? BRAND_COLOR : '#e0e0e0',
                backgroundColor: selectedPlan === 'yearly' ? BRAND_COLOR : 'transparent',
              }}
            >
              {selectedPlan === 'yearly' && <Check size={12} className="text-white" />}
            </div>
          </button>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <Check size={12} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* No Payment Due */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Check size={16} style={{ color: BRAND_COLOR }} />
          <p className="text-xs font-medium text-foreground">No Payment Due Now</p>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          onClick={handleStartTrial}
          disabled={isLoading}
          className="w-full text-white text-base font-bold py-6 rounded-2xl"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          {isLoading ? 'Processing...' : 'Start My 3-Day Free Trial'}
        </Button>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          {selectedPlan === 'yearly' 
            ? '3 days free, then $28.20 per year ($2.35/mo)'
            : '3 days free, then $3.99 per month'}
        </p>
      </div>
    </div>
  );
}
