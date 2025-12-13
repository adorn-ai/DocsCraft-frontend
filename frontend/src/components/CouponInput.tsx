import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
//import { Badge } from '@/components/ui/badge';
import { Loader2, Tag, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface CouponInputProps {
  subscriptionAmount: number; // KES amount for backend
  onCouponApplied: (discountAmount: number, finalAmount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
  disabled?: boolean;
  exchangeRate?: number; // Add exchange rate prop
}

export function CouponInput({ 
  subscriptionAmount, 
  onCouponApplied, 
  onCouponRemoved,
  disabled = false,
  exchangeRate = 129.6 // Default exchange rate
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
    description?: string;
    discountType?: string;
    discountValue?: number;
  } | null>(null);

  const kesToUsd = (kes: number): number => {
    return kes / exchangeRate;
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_URL}/paystack/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          coupon_code: couponCode,
          subscription_amount: subscriptionAmount
        })
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discountAmount: data.discount_amount,
          finalAmount: data.final_amount,
          description: data.coupon_details?.description,
          discountType: data.coupon_details?.discount_type,
          discountValue: data.coupon_details?.discount_value
        });
        onCouponApplied(data.discount_amount, data.final_amount, couponCode.toUpperCase());
        toast.success('Coupon applied!', {
          description: data.message
        });
      } else {
        toast.error('Invalid coupon', {
          description: data.message
        });
      }
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      toast.error('Failed to validate coupon', {
        description: 'Please try again'
      });
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onCouponRemoved();
    toast.info('Coupon removed');
  };

  if (appliedCoupon) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">
                {appliedCoupon.code}
                {appliedCoupon.discountType === 'percentage' && (
                  <span className="ml-2 text-sm">({appliedCoupon.discountValue}% off)</span>
                )}
              </p>
              {appliedCoupon.description && (
                <p className="text-sm text-green-700">{appliedCoupon.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeCoupon}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center px-1">
          <span className="text-sm text-gray-600">Discount:</span>
          <span className="font-semibold text-green-600">
            -${kesToUsd(appliedCoupon.discountAmount).toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && !disabled && validateCoupon()}
            className="pl-10"
            disabled={validating || disabled}
          />
        </div>
        <Button
          onClick={validateCoupon}
          disabled={validating || !couponCode.trim() || disabled}
          variant="outline"
        >
          {validating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking
            </>
          ) : (
            'Apply'
          )}
        </Button>
      </div>

      {/* Popular coupons */}
      {/*
            <div className="flex flex-wrap gap-2">
        <p className="text-xs text-gray-500 w-full">Try these codes:</p>
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:bg-orange-100 transition-colors" 
          onClick={() => !disabled && setCouponCode('BETA50')}
        >
          BETA50
        </Badge>
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:bg-orange-100 transition-colors" 
          onClick={() => !disabled && setCouponCode('EARLYBIRD')}
        >
          EARLYBIRD
        </Badge>
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:bg-orange-100 transition-colors" 
          onClick={() => !disabled && setCouponCode('WELCOME100')}
        >
          WELCOME100
        </Badge>
      </div>
      */}
    </div>
  );
}