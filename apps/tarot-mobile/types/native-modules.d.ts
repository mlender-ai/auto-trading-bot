// react-native-google-mobile-ads — stub types for type checking
// 실제 구현은 EAS 네이티브 빌드에서 제공됨

declare module "react-native-google-mobile-ads" {
  import type { ViewStyle } from "react-native";

  export type BannerAdSize = string;

  export interface BannerAdProps {
    unitId: string;
    size?: BannerAdSize;
    requestOptions?: { requestNonPersonalizedAdsOnly?: boolean };
    onAdLoaded?: () => void;
    onAdFailedToLoad?: (error: Error) => void;
    style?: ViewStyle;
  }
  export const BannerAd: import("react").ComponentType<BannerAdProps>;
  export const BannerAdSize: {
    ANCHORED_ADAPTIVE_BANNER: BannerAdSize;
    BANNER: BannerAdSize;
  };
  export const TestIds: {
    BANNER: string;
    REWARDED: string;
    INTERSTITIAL: string;
  };

  export interface RewardedAdCallbacks {
    load: () => void;
    show: () => void;
    addAdEventListener: (event: string, handler: (...args: unknown[]) => void) => () => void;
  }
  export function RewardedAd(
    unitId: string,
    requestOptions?: object
  ): RewardedAdCallbacks;
  export const RewardedAdEventType: {
    LOADED: string;
    EARNED_REWARD: string;
    CLOSED: string;
  };

  const mobileAds: () => { initialize: () => Promise<void> };
  export default mobileAds;
}

// react-native-purchases — stub types for RevenueCat
declare module "react-native-purchases" {
  export interface Product {
    productIdentifier: string;
    identifier: string;
    title: string;
    priceString: string;
    currencyCode: string;
  }
  export interface PurchasesPackage {
    identifier: string;
    product: Product;
  }
  export interface CustomerInfo {
    entitlements: {
      active: Record<string, { isActive: boolean }>;
    };
  }
  const Purchases: {
    configure: (config: { apiKey: string }) => void;
    getOfferings: () => Promise<{
      current: { availablePackages: PurchasesPackage[] } | null;
    }>;
    getCustomerInfo: () => Promise<CustomerInfo>;
    purchasePackage: (
      pkg: PurchasesPackage
    ) => Promise<{ customerInfo: CustomerInfo }>;
    restorePurchases: () => Promise<CustomerInfo>;
    logIn: (
      appUserId: string
    ) => Promise<{ customerInfo: CustomerInfo; created: boolean }>;
    logOut: () => Promise<CustomerInfo>;
  };
  export default Purchases;
}
