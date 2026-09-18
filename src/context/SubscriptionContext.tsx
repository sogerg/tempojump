import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { PRO_ENTITLEMENT_ID, REVENUECAT_API_KEYS } from '../constants/revenuecat';

interface SubscriptionContextValue {
  isPro: boolean;
  isLoading: boolean;
  offering: PurchasesOffering | null;
  purchasePackage: (packageId: string) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  refreshOfferings: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function hasProEntitlement(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [hasEntitlement, setHasEntitlement] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  const fetchOfferings = () => {
    Purchases.getOfferings()
      .then((offerings) => setOffering(offerings.current))
      .catch(() => setOffering(null));
  };

  useEffect(() => {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android;

    // `configure` lève si la clé est refusée ou si la boutique native est absente. Sans ce
    // try/catch, l'exception remonte et l'app entière ne s'affiche plus : un problème de clé
    // RevenueCat tuerait l'app au lancement au lieu de seulement priver l'utilisateur du paywall.
    // Ce n'est pas théorique, des produits iOS du compte sont déjà restés bloqués « Could not
    // check ». C'est aussi ce qui empêchait de tester l'app dans Expo Go.
    let configured = false;
    try {
      Purchases.configure({ apiKey });
      configured = true;
    } catch (error) {
      console.warn('RevenueCat non configuré, achats indisponibles', error);
    }

    if (!configured) {
      setIsLoading(false);
      return;
    }

    Purchases.getCustomerInfo()
      .then((customerInfo) => setHasEntitlement(hasProEntitlement(customerInfo)))
      .catch(() => setHasEntitlement(false))
      .finally(() => setIsLoading(false));

    fetchOfferings();

    const listener = (customerInfo: CustomerInfo) => setHasEntitlement(hasProEntitlement(customerInfo));
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
    setHasEntitlement(hasProEntitlement(customerInfo));
  };

  const restorePurchases = async () => {
    const customerInfo = await Purchases.restorePurchases();
    const restoredIsPro = hasProEntitlement(customerInfo);
    setHasEntitlement(restoredIsPro);
    return restoredIsPro;
  };

  const value: SubscriptionContextValue = {
    isPro: hasEntitlement,
    isLoading,
    offering,
    purchasePackage,
    restorePurchases,
    refreshOfferings: fetchOfferings,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
}
