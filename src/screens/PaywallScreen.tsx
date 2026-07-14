import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PACKAGE_TYPE, PurchasesPackage } from 'react-native-purchases';
import { useSubscription } from '../context/SubscriptionContext';
import { useSettings } from '../context/SettingsContext';
import { FONTS } from '../constants/typography';

function packageLabel(pkg: PurchasesPackage, t: (key: string) => string): { title: string; period: string } {
  if (pkg.packageType === PACKAGE_TYPE.ANNUAL) {
    return { title: t('paywall.yearly'), period: t('paywall.perYear') };
  }
  return { title: t('paywall.weekly'), period: t('paywall.perWeek') };
}

export function PaywallScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const { offering, purchasePackage, restorePurchases, refreshOfferings } = useSubscription();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const packages = offering?.availablePackages ?? [];
  const activeId = selectedId ?? packages.find((p) => p.packageType === PACKAGE_TYPE.ANNUAL)?.identifier ?? packages[0]?.identifier ?? null;

  const handleSubscribe = async () => {
    if (!activeId) return;
    setIsPurchasing(true);
    try {
      await purchasePackage(activeId);
    } catch (error: any) {
      if (!error?.userCancelled) {
        Alert.alert(t('paywall.title'), t('paywall.purchaseError'));
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const restoredIsPro = await restorePurchases();
      if (!restoredIsPro) {
        Alert.alert(t('paywall.title'), t('paywall.restoreNoneFound'));
      }
    } catch {
      Alert.alert(t('paywall.title'), t('paywall.purchaseError'));
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text, fontFamily: FONTS.heading }]}>{t('paywall.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('paywall.subtitle')}</Text>

        <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.badgeText, { color: colors.accentGold }]}>{t('paywall.trialBadge')}</Text>
        </View>

        {!offering && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('paywall.loadError')}</Text>
            <TouchableOpacity style={[styles.retryButton, { borderColor: colors.cardBorder }]} onPress={refreshOfferings}>
              <Text style={{ color: colors.text }}>{t('paywall.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {packages.map((pkg) => {
          const { title, period } = packageLabel(pkg, t);
          const isSelected = pkg.identifier === activeId;
          return (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.packageCard,
                { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.cardBorder },
                isSelected && styles.packageCardSelected,
              ]}
              onPress={() => setSelectedId(pkg.identifier)}
            >
              <Text style={[styles.packageTitle, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.packagePrice, { color: colors.text }]}>
                {pkg.product.priceString}
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>{period}</Text>
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>{t('paywall.trialDisclaimer')}</Text>

        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: colors.primary, opacity: activeId ? 1 : 0.5 }]}
          onPress={handleSubscribe}
          disabled={!activeId || isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.subscribeText, { color: colors.primaryText }]}>{t('paywall.subscribe')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={isRestoring}>
          {isRestoring ? (
            <ActivityIndicator color={colors.textMuted} />
          ) : (
            <Text style={[styles.restoreText, { color: colors.textMuted }]}>{t('paywall.restore')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  packageCard: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  packageCardSelected: {
    borderWidth: 2,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  subscribeButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeText: {
    fontSize: 17,
    fontWeight: '700',
  },
  restoreButton: {
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
