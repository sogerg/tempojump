import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { PRO_ENTITLEMENT_ID, REVENUECAT_API_KEYS, REVIEW_BYPASS_CODE } from '../constants/revenuecat';
import { loadReviewBypass, saveReviewBypass } from '../lib/storage';

interface SubscriptionContextValue {
  isPro: boolean;
  isLoading: boolean;
  offering: PurchasesOffering | null;
  purchasePackage: (packageId: string) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  refreshOfferings: () => void;
  activateReviewBypass: (code: string) => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function hasProEntitlement(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [hasEntitlement, setHasEntitlement] = useState(false);
  const [reviewBypass, setReviewBypass] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  const fetchOfferings = () => {
    Purchases.getOfferings()
      .then((offerings) => setOffering(offerings.current))
      .catch(() => setOffering(null));
  };

  useEffect(() => {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android;
    Purchases.configure({ apiKey });

    Purchases.getCustomerInfo()
      .then((customerInfo) => setHasEntitlement(hasProEntitlement(customerInfo)))
      .finally(() => setIsLoading(false));

    loadReviewBypass().then(setReviewBypass);

    fetchOfferings();

    const listener = (customerInfo: CustomerInfo) => setHasEntitlement(hasProEntitlement(customerInfo));
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  const activateReviewBypass = async (code: string) => {
    if (code.trim().toUpperCase() !== REVIEW_BYPASS_CODE) return false;
    await saveReviewBypass(true);
    setReviewBypass(true);
    return true;
  };

  const purchasePackage = async (packageId: string) => {
    if (!offering) return;
    const pkg = offering.availablePackages.find((p) => p.identifier === packageId);
    if (!pkg) return;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    setHasEntitlement(hasProEntitlement(customerInfo));
  };

  const restorePurchases = async () => {
    const customerInfo = await Purchases.restorePurchases();
    const restoredIsPro = hasProEntitlement(customerInfo);
    setHasEntitlement(restoredIsPro);
    return restoredIsPro;
  };

  const value: SubscriptionContextValue = {
    isPro: hasEntitlement || reviewBypass,
    isLoading,
    offering,
    purchasePackage,
    restorePurchases,
    refreshOfferings: fetchOfferings,
    activateReviewBypass,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
}
