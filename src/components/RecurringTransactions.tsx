import { useState } from 'react';
import { Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface RecurringTransaction {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  amount: number;
  nextDate: string;
}

interface RecurringTransactionsProps {
  jarId: number;
  jarName: string;
  recurringTransaction?: RecurringTransaction;
  onSave: (jarId: number, transaction: RecurringTransaction) => void;
}

export const RecurringTransactions = ({ 
  jarId, 
  jarName, 
  recurringTransaction, 
  onSave 
}: RecurringTransactionsProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(recurringTransaction?.enabled || false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(
    recurringTransaction?.frequency || 'weekly'
  );
  const [amount, setAmount] = useState(recurringTransaction?.amount?.toString() || '');

  const getNextDate = (freq: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    switch (freq) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toISOString();
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount for recurring transactions.",
        variant: "destructive",
      });
      return;
    }

    const transaction: RecurringTransaction = {
      enabled,
      frequency,
      amount: parseFloat(amount),
      nextDate: getNextDate(frequency),
    };

    onSave(jarId, transaction);
    setOpen(false);
    
    toast({
      title: "Recurring Transaction Saved",
      description: `${enabled ? 'Enabled' : 'Disabled'} ${frequency} contribution of €${amount} for ${jarName}`,
    });
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Every Day';
      case 'weekly': return 'Every Week';
      case 'monthly': return 'Every Month';
      default: return freq;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Clock size={16} className="mr-2" />
          Recurring Transactions
          {recurringTransaction?.enabled && (
            <Bell size={14} className="ml-2 text-primary" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recurring Transactions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable Recurring Contributions</Label>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {getFrequencyLabel(frequency)} contribution of €{amount || '0.00'} will be added to <strong>{jarName}</strong>
                </p>
              </div>
            </>
          )}

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
