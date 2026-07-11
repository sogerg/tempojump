import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { PRO_ENTITLEMENT_ID, REVENUECAT_API_KEYS } from '../constants/revenuecat';

interface SubscriptionContextValue {
  isPro: boolean;
  isLoading: boolean;
  offering: PurchasesOffering | null;
  purchasePackage: (packageId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function hasProEntitlement(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android;
    Purchases.configure({ apiKey });

    Purchases.getCustomerInfo()
      .then((customerInfo) => setIsPro(hasProEntitlement(customerInfo)))
      .finally(() => setIsLoading(false));

    Purchases.getOfferings()
      .then((offerings) => setOffering(offerings.current))
      .catch(() => setOffering(null));

    const listener = (customerInfo: CustomerInfo) => setIsPro(hasProEntitlement(customerInfo));
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  const purchasePackage = async (packageId: string) => {
    if (!offering) return;
    const pkg = offering.availablePackages.find((p) => p.identifier === packageId);
    if (!pkg) return;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    setIsPro(hasProEntitlement(customerInfo));
  };

  const restorePurchases = async () => {
    const customerInfo = await Purchases.restorePurchases();
    setIsPro(hasProEntitlement(customerInfo));
  };

  const value: SubscriptionContextValue = {
    isPro,
    isLoading,
    offering,
    purchasePackage,
    restorePurchases,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
}
