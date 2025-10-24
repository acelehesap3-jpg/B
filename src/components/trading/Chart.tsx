import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Candle } from '@/types/trading';
import { calcSMA, calcEMA, calcRSI, calcMACD, calcBollingerBands, calcFibonacciLevels } from '@/lib/indicators';
import { ApexOptions } from 'apexcharts';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartProps {
  candles: Candle[];
  showSMA: boolean;
  showEMA: boolean;
  showRSI: boolean;
  showMACD?: boolean;
  showBB?: boolean;
  showFib?: boolean;
  smaPeriod: number;
  emaPeriod: number;
  rsiPeriod: number;
  symbol: string;
}

export function Chart({
  candles,
  showSMA,
  showEMA,
  showRSI,
  showMACD = false,
  showBB = false,
  showFib = false,
  smaPeriod,
  emaPeriod,
  rsiPeriod,
  symbol,
}: ChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const closes = candles.map((c) => c.y[3]);
  const smaData = calcSMA(closes, smaPeriod);
  const emaData = calcEMA(closes, emaPeriod);
  const rsiData = calcRSI(closes, rsiPeriod);
  const macdData = calcMACD(closes);
  const bbData = calcBollingerBands(closes);
  const fibLevels = showFib ? calcFibonacciLevels(candles) : [];

  const candlestickSeries: any[] = [
    {
      name: 'Price',
      type: 'candlestick',
      data: candles,
    },
  ];

  if (showSMA) {
    candlestickSeries.push({
      name: `SMA(${smaPeriod})`,
      type: 'line',
      data: candles.map((c, i) => ({
        x: c.x,
        y: smaData[i],
      })),
    });
  }

  if (showEMA) {
    candlestickSeries.push({
      name: `EMA(${emaPeriod})`,
      type: 'line',
      data: candles.map((c, i) => ({
        x: c.x,
        y: emaData[i],
      })),
    });
  }

  if (showBB) {
    candlestickSeries.push(
      {
        name: 'BB Upper',
        type: 'line',
        data: candles.map((c, i) => ({ x: c.x, y: bbData.upper[i] })),
      },
      {
        name: 'BB Lower',
        type: 'line',
        data: candles.map((c, i) => ({ x: c.x, y: bbData.lower[i] })),
      }
    );
  }

  const fibAnnotations = showFib
    ? fibLevels.map((fib) => ({
        y: fib.price,
        borderColor: 'hsl(var(--primary))',
        strokeDashArray: 2,
        opacity: 0.4,
        label: {
          text: fib.label,
          style: {
            color: 'hsl(var(--primary-foreground))',
            background: 'hsl(var(--primary))',
            fontSize: '10px',
          },
        },
      }))
    : [];

  const candlestickOptions: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: isFullscreen ? 600 : 360,
      background: 'transparent',
      toolbar: {
        autoSelected: 'zoom',
        tools: {
          download: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: false,
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: 'hsl(var(--success))',
          downward: 'hsl(var(--destructive))',
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: 'hsl(var(--muted-foreground))',
        },
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        style: {
          colors: 'hsl(var(--muted-foreground))',
        },
        formatter: (value) => value.toFixed(2),
      },
    },
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
      x: {
        format: 'dd MMM yyyy HH:mm',
      },
    },
    legend: {
      show: true,
      position: 'top',
      labels: {
        colors: 'hsl(var(--foreground))',
      },
    },
    stroke: {
      width: [1, 2, 2, 2, 2],
    },
    colors: [
      'hsl(var(--primary))',
      '#f1c40f',
      'hsl(var(--chart-1))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
    ],
    annotations: {
      yaxis: fibAnnotations,
    },
  };

  const rsiSeries = [
    {
      name: 'RSI',
      data: candles.map((c, i) => ({
        x: c.x,
        y: rsiData[i],
      })),
    },
  ];

  const rsiOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 120,
      background: 'transparent',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: false,
      },
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    colors: ['hsl(var(--chart-2))'],
    xaxis: {
      type: 'datetime',
      labels: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        style: {
          colors: 'hsl(var(--muted-foreground))',
        },
      },
    },
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    annotations: {
      yaxis: [
        {
          y: 70,
          borderColor: 'hsl(var(--destructive))',
          strokeDashArray: 4,
          label: {
            text: 'Overbought',
            style: {
              color: 'hsl(var(--destructive-foreground))',
              background: 'hsl(var(--destructive))',
            },
          },
        },
        {
          y: 30,
          borderColor: 'hsl(var(--success))',
          strokeDashArray: 4,
          label: {
            text: 'Oversold',
            style: {
              color: 'hsl(var(--success-foreground))',
              background: 'hsl(var(--success))',
            },
          },
        },
      ],
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy HH:mm',
      },
    },
  };

  const macdSeries = [
    {
      name: 'MACD',
      type: 'line',
      data: candles.map((c, i) => ({ x: c.x, y: macdData.macd[i] })),
    },
    {
      name: 'Signal',
      type: 'line',
      data: candles.map((c, i) => ({ x: c.x, y: macdData.signal[i] })),
    },
    {
      name: 'Histogram',
      type: 'bar',
      data: candles.map((c, i) => ({ x: c.x, y: macdData.histogram[i] })),
    },
  ];

  const macdOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 140,
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    stroke: { width: [2, 2, 0], curve: 'smooth' },
    colors: ['hsl(var(--chart-1))', 'hsl(var(--chart-4))', 'hsl(var(--chart-2))'],
    xaxis: {
      type: 'datetime',
      labels: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: 'hsl(var(--muted-foreground))' },
      },
    },
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 4,
    },
    legend: {
      show: true,
      position: 'top',
      labels: { colors: 'hsl(var(--foreground))' },
    },
    tooltip: {
      theme: 'dark',
      x: { format: 'dd MMM yyyy HH:mm' },
    },
  };

  if (!candles.length) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-lg border border-border bg-black/20">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel-neon hover-lift rounded-2xl p-5 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-2 ring-primary/30">
                <div className="h-4 w-4 rounded bg-gradient-to-br from-primary to-primary/60" />
              </div>
              <h3 className="font-mono text-base font-black text-foreground tracking-tight">
                {symbol.toUpperCase()} <span className="text-muted-foreground">/</span> USDT
              </h3>
              <div className="status-dot bg-success" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="rounded-xl overflow-hidden border border-border/50 bg-background/20">
            <ReactApexChart
              options={candlestickOptions}
              series={candlestickSeries}
              type="candlestick"
              height={isFullscreen ? 600 : 400}
            />
          </div>
        </div>
      </div>

      {showRSI && (
        <div className="glass-panel-strong animate-fade-in-up hover-lift rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-chart-2 to-transparent opacity-30" />
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-chart-2 animate-breathe" />
            <div className="text-xs font-bold text-foreground uppercase tracking-wider">
              RSI Oscillator <span className="text-muted-foreground">({rsiPeriod})</span>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-border/30 bg-background/10">
            <ReactApexChart options={rsiOptions} series={rsiSeries} type="line" height={130} />
          </div>
        </div>
      )}

      {showMACD && (
        <div className="glass-panel-strong animate-fade-in-up hover-lift rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-chart-1 to-transparent opacity-30" />
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-chart-1 animate-breathe" />
            <div className="text-xs font-bold text-foreground uppercase tracking-wider">
              MACD Indicator
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-border/30 bg-background/10">
            <ReactApexChart options={macdOptions} series={macdSeries} type="line" height={150} />
          </div>
        </div>
      )}
    </div>
  );
}
