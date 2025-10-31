import { memo, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Candle } from '@/types/trading';
import { calcSMA, calcEMA, calcRSI, calcMACD, calcBollingerBands } from '@/lib/indicators';

interface OptimizedChartProps {
  candles: Candle[];
  showSMA?: boolean;
  showEMA?: boolean;
  showRSI?: boolean;
  showMACD?: boolean;
  showBB?: boolean;
  showFib?: boolean;
  smaPeriod?: number;
  emaPeriod?: number;
  rsiPeriod?: number;
  symbol: string;
}

export const OptimizedChart = memo(({
  candles,
  showSMA = true,
  showEMA = true,
  showRSI = true,
  showMACD = false,
  showBB = false,
  showFib = false,
  smaPeriod = 20,
  emaPeriod = 20,
  rsiPeriod = 14,
  symbol
}: OptimizedChartProps) => {
  const chartSeries = useMemo(() => {
    const series: any[] = [{
      name: 'Price',
      type: 'candlestick',
      data: candles.map((c) => ({
        x: c.x,
        y: c.y,
      })),
    }];

    if (showSMA && candles.length >= smaPeriod) {
      const prices = candles.map(c => c.y[3]);
      const sma = calcSMA(prices, smaPeriod);
      series.push({
        name: `SMA ${smaPeriod}`,
        type: 'line',
        data: sma.map((value, idx) => ({
          x: candles[idx]?.x,
          y: value,
        })),
      });
    }

    if (showEMA && candles.length >= emaPeriod) {
      const prices = candles.map(c => c.y[3]);
      const ema = calcEMA(prices, emaPeriod);
      series.push({
        name: `EMA ${emaPeriod}`,
        type: 'line',
        data: ema.map((value, idx) => ({
          x: candles[idx]?.x,
          y: value,
        })),
      });
    }

    if (showBB && candles.length >= 20) {
      const prices = candles.map(c => c.y[3]);
      const bb = calcBollingerBands(prices, 20, 2);
      series.push(
        {
          name: 'BB Upper',
          type: 'line',
          data: bb.upper.map((value, idx) => ({
            x: candles[idx]?.x,
            y: value,
          })),
        },
        {
          name: 'BB Middle',
          type: 'line',
          data: bb.middle.map((value, idx) => ({
            x: candles[idx]?.x,
            y: value,
          })),
        },
        {
          name: 'BB Lower',
          type: 'line',
          data: bb.lower.map((value, idx) => ({
            x: candles[idx]?.x,
            y: value,
          })),
        }
      );
    }

    return series;
  }, [candles, showSMA, showEMA, showBB, smaPeriod, emaPeriod]);

  const rsiSeries = useMemo(() => {
    if (!showRSI || candles.length < rsiPeriod + 1) return [];
    const prices = candles.map(c => c.y[3]);
    const rsi = calcRSI(prices, rsiPeriod);
    return [{
      name: 'RSI',
      data: rsi.map((value, idx) => ({
        x: candles[idx]?.x,
        y: value,
      })),
    }];
  }, [candles, showRSI, rsiPeriod]);

  const macdSeries = useMemo(() => {
    if (!showMACD || candles.length < 26) return [];
    const prices = candles.map(c => c.y[3]);
    const macd = calcMACD(prices);
    return [
      {
        name: 'MACD',
        type: 'line',
        data: macd.macd.map((value, idx) => ({
          x: candles[idx]?.x,
          y: value,
        })),
      },
      {
        name: 'Signal',
        type: 'line',
        data: macd.signal.map((value, idx) => ({
          x: candles[idx]?.x,
          y: value,
        })),
      },
      {
        name: 'Histogram',
        type: 'bar',
        data: macd.histogram.map((value, idx) => ({
          x: candles[idx]?.x,
          y: value,
        })),
      },
    ];
  }, [candles, showMACD]);

  const chartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'candlestick',
      background: 'transparent',
      toolbar: {
        show: true,
        tools: {
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: false, // Performance optimization
      },
    },
    theme: {
      mode: 'dark',
    },
    title: {
      text: `${symbol.toUpperCase()} Chart`,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: 'hsl(189 100% 58%)',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: 'hsl(215 25% 65%)',
        },
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        style: {
          colors: 'hsl(215 25% 65%)',
        },
        formatter: (val: number) => val?.toFixed(2),
      },
    },
    grid: {
      borderColor: 'hsl(220 40% 14%)',
      strokeDashArray: 4,
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: 'hsl(158 88% 48%)',
          downward: 'hsl(0 88% 62%)',
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    stroke: {
      width: [1, 2, 2, 1, 1, 1],
      curve: 'smooth',
    },
    colors: ['hsl(189 100% 58%)', 'hsl(285 90% 68%)', 'hsl(158 88% 48%)', 'hsl(40 96% 62%)', 'hsl(345 88% 65%)'],
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
    },
    legend: {
      show: true,
      position: 'top',
      labels: {
        colors: 'hsl(215 25% 65%)',
      },
    },
  }), [symbol]);

  const rsiOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'line',
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    theme: { mode: 'dark' },
    title: {
      text: 'RSI',
      style: {
        fontSize: '14px',
        color: 'hsl(189 100% 58%)',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: { show: false },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        style: { colors: 'hsl(215 25% 65%)' },
      },
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    colors: ['hsl(285 90% 68%)'],
    grid: {
      borderColor: 'hsl(220 40% 14%)',
      strokeDashArray: 4,
      yaxis: {
        lines: { show: true },
      },
    },
    annotations: {
      yaxis: [
        { y: 70, borderColor: 'hsl(0 88% 62%)', strokeDashArray: 2 },
        { y: 30, borderColor: 'hsl(158 88% 48%)', strokeDashArray: 2 },
      ],
    },
  }), []);

  const macdOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'line',
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    theme: { mode: 'dark' },
    title: {
      text: 'MACD',
      style: {
        fontSize: '14px',
        color: 'hsl(189 100% 58%)',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: 'hsl(215 25% 65%)' },
        formatter: (val: number) => val?.toFixed(2),
      },
    },
    stroke: {
      width: [2, 2, 1],
      curve: 'smooth',
    },
    colors: ['hsl(189 100% 58%)', 'hsl(40 96% 62%)', 'hsl(345 88% 65%)'],
    grid: {
      borderColor: 'hsl(220 40% 14%)',
      strokeDashArray: 4,
    },
  }), []);

  return (
    <div className="space-y-4">
      <div className="glass-panel-neon rounded-2xl p-4 animate-fade-in">
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="candlestick"
          height={450}
        />
      </div>

      {showRSI && rsiSeries.length > 0 && (
        <div className="glass-panel rounded-xl p-3 animate-fade-in">
          <ReactApexChart
            options={rsiOptions}
            series={rsiSeries}
            type="line"
            height={150}
          />
        </div>
      )}

      {showMACD && macdSeries.length > 0 && (
        <div className="glass-panel rounded-xl p-3 animate-fade-in">
          <ReactApexChart
            options={macdOptions}
            series={macdSeries}
            type="line"
            height={150}
          />
        </div>
      )}
    </div>
  );
});

OptimizedChart.displayName = 'OptimizedChart';
