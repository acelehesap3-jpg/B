import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ChartComponent = lazy(() => import('./OptimizedChart'));
const OrderBookComponent = lazy(() => import('./OrderBook'));
const OrderPanelComponent = lazy(() => import('./OrderPanel'));
const TradeFeedComponent = lazy(() => import('./TradeFeed'));
const PerformanceMetricsComponent = lazy(() => import('./PerformanceMetrics'));
const MarketScannerComponent = lazy(() => import('./MarketScanner'));
const PriceAlertsComponent = lazy(() => import('./PriceAlerts'));

export const ChartLayer = (props: any) => (
  <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
    <ChartComponent {...props} />
  </Suspense>
);

export const OrderBookLayer = (props: any) => (
  <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
    <OrderBookComponent {...props} />
  </Suspense>
);

export const OrderPanelLayer = (props: any) => (
  <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
    <OrderPanelComponent {...props} />
  </Suspense>
);

export const TradeFeedLayer = (props: any) => (
  <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
    <TradeFeedComponent {...props} />
  </Suspense>
);

export const PerformanceMetricsLayer = (props: any) => (
  <Suspense fallback={<Skeleton className="w-full h-[200px]" />}>
    <PerformanceMetricsComponent {...props} />
  </Suspense>
);

export const MarketScannerLayer = (props: any) => (
  <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
    <MarketScannerComponent {...props} />
  </Suspense>
);

export const PriceAlertsLayer = (props: any) => (
  <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
    <PriceAlertsComponent {...props} />
  </Suspense>
);
