import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2, Crown, Calendar, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { CouponInput } from "@/components/CouponInput";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Pricing configuration
const EXCHANGE_RATE = 129.6;
const BASE_PRICE_USD = 5.99;
const BASE_PRICE_KES = 776;

interface Subscription {
  subscribed: boolean;
  subscription?: {
    status: string;
    created_at: string;
    amount: number;
  };
}

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  const [finalPriceKES, setFinalPriceKES] = useState(BASE_PRICE_KES);
  const [finalPriceUSD, setFinalPriceUSD] = useState(BASE_PRICE_USD);
  const [discountAmountUSD, setDiscountAmountUSD] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setCheckingSubscription(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_URL}/paystack/subscription`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const calculateNextRenewal = (createdAt: string) => {
    const created = new Date(createdAt);
    const nextRenewal = new Date(created);
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    return nextRenewal.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const kesToUsd = (kes: number): number => kes / EXCHANGE_RATE;

  const handleCouponApplied = (discountKES: number, finalKES: number, code: string) => {
    setDiscountAmountUSD(kesToUsd(discountKES));
    setFinalPriceKES(finalKES);
    setFinalPriceUSD(kesToUsd(finalKES));
    setAppliedCouponCode(code);
  };

  const handleCouponRemoved = () => {
    setDiscountAmountUSD(0);
    setFinalPriceKES(BASE_PRICE_KES);
    setFinalPriceUSD(BASE_PRICE_USD);
    setAppliedCouponCode(null);
  };

  const handleUpgrade = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_URL}/paystack/initialize-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          plan: "pro",
          coupon_code: appliedCouponCode,
          final_amount: finalPriceKES,
        }),
      });

      if (!response.ok) throw new Error("Failed to initialize payment");
      const data = await response.json();
      window.location.href = data.authorization_url;
    } catch (error: any) {
      toast.error("Payment Error", { description: error.message });
      setLoading(false);
    }
  };

  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate professional documentation for your repositories with AI-powered tools
          </p>
        </div>

        {/* Active Subscription Banner */}
        {subscription?.subscribed && subscription.subscription && (
          <Card className="mb-12 border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-900 mb-2 flex items-center gap-2">
                    You're a Pro member! 🎉
                    <Zap className="h-5 w-5 text-orange-500" />
                  </h3>
                  <p className="text-orange-800 mb-4">
                    Enjoy unlimited access to all premium features.
                  </p>
                  <div className="flex items-center gap-2 text-orange-700 bg-orange-100 w-fit px-3 py-1.5 rounded-lg">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Renews on {calculateNextRenewal(subscription.subscription.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards - Modern Stacked Layout */}
        <div className="relative max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Free Plan - Subtle Background Card */}
            <div className="relative">
              <Card className={`h-full border-2 transition-all duration-300 hover:shadow-lg ${
                subscription?.subscribed ? "opacity-70" : "hover:scale-[1.02]"
              }`}>
                <CardHeader className="pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-3xl">Free</CardTitle>
                    <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                      Trial
                    </div>
                  </div>
                  <CardDescription className="text-base">Perfect for trying out our platform</CardDescription>
                  <div className="mt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold">$0</span>
                      <span className="text-gray-600 text-lg">/month</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-green-100 rounded-full">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">2 generations per month</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-green-100 rounded-full">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">README documentation only</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-green-100 rounded-full">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">Public repositories</span>
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base"
                    disabled={!subscription?.subscribed}
                  >
                    {subscription?.subscribed ? "Subscribed to Pro" : "Current Plan"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Pro Plan - Featured Card with Gradient */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur opacity-20"></div>
              
              <Card className={`relative h-full border-2 border-orange-300 bg-gradient-to-br from-white to-orange-50 shadow-2xl transition-all duration-300 ${
                !subscription?.subscribed && "hover:scale-[1.02]"
              }`}>
                {/* Popular Badge */}
                {!subscription?.subscribed && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                {/* Active Badge */}
                {subscription?.subscribed && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      ACTIVE PLAN
                    </div>
                  </div>
                )}

                <CardHeader className="pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-3xl bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                      Pro
                    </CardTitle>
                    <Zap className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardDescription className="text-base">For developers who ship fast</CardDescription>
                  
                  <div className="mt-6">
                    {/* Discount Badge */}
                    {discountAmountUSD > 0 && (
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl text-gray-400 line-through font-medium">
                          ${BASE_PRICE_USD.toFixed(2)}
                        </span>
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                          SAVE ${discountAmountUSD.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${
                        discountAmountUSD > 0 ? "text-green-600" : "bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent"
                      }`}>
                        ${finalPriceUSD.toFixed(2)}
                      </span>
                      <span className="text-gray-600 text-lg">/month</span>
                    </div>
                    

                  </div>
                </CardHeader>

                <CardContent>
                  {/* Features */}
                  <ul className="space-y-4 mb-6">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-orange-100 rounded-full">
                        <Check className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-gray-900 font-medium">Unlimited generations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-orange-100 rounded-full">
                        <Check className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <span className="text-gray-900 font-medium">All document types</span>
                        <p className="text-xs text-gray-600 mt-0.5">README, API.md, CONTRIBUTING.md, CHANGELOG.md</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-orange-100 rounded-full">
                        <Check className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-gray-900">Public and Private repositories</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-orange-100 rounded-full">
                        <Check className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-gray-900">Priority support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 p-0.5 bg-orange-100 rounded-full">
                        <Check className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-gray-900">Advanced customization</span>
                    </li>
                  </ul>

                  {/* Coupon Input */}
                  {!subscription?.subscribed && (
                    <div className="mb-6 p-4 bg-white rounded-xl border-2 border-orange-200 shadow-sm">
                      <p className="text-sm font-semibold mb-3 text-gray-700">
                        💎 Have a coupon code?
                      </p>
                      <CouponInput
                        subscriptionAmount={BASE_PRICE_KES}
                        onCouponApplied={handleCouponApplied}
                        onCouponRemoved={handleCouponRemoved}
                        disabled={loading}
                        exchangeRate={EXCHANGE_RATE}
                      />
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    className={`w-full h-14 text-base font-semibold shadow-lg transition-all ${
                      subscription?.subscribed
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    }`}
                    onClick={handleUpgrade}
                    disabled={loading || subscription?.subscribed}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : subscription?.subscribed ? (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Active Subscription
                      </>
                    ) : (
                      <>Upgrade to Pro - ${finalPriceUSD.toFixed(2)}/mo</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Trust Signals - Footer */}
        <div className="mt-20 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Secure payments powered by Paystack • Supports M-Pesa, Credit/Debit Cards & Bank Transfer
          </p>
        </div>
      </main>
    </div>
  );
}