import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  exchange?: string;
  marketType: 'crypto' | 'forex' | 'stocks' | 'indices';
  interval?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
}

let tvScriptLoadingPromise: Promise<void>;

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  exchange,
  marketType,
  interval = '15',
  theme = 'dark',
  width = '100%',
  height = '500'
}) => {
  const onLoadScriptRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById('tradingview_chart') && 'TradingView' in window) {
        const getExchange = () => {
          switch (marketType) {
            case 'crypto':
              return exchange || 'BINANCE';
            case 'forex':
              return exchange || 'OANDA';
            case 'stocks':
              return exchange || 'NASDAQ';
            case 'indices':
              return exchange || 'INDEX';
            default:
              return exchange || 'BINANCE';
          }
        };

        const getFullSymbol = () => {
          switch (marketType) {
            case 'crypto':
              return `${getExchange()}:${symbol}`;
            case 'forex':
              return `${getExchange()}:${symbol}`;
            case 'stocks':
              return `${getExchange()}:${symbol}`;
            case 'indices':
              return `${getExchange()}:${symbol}`;
            default:
              return symbol;
          }
        };

        new (window as any).TradingView.widget({
          symbol: getFullSymbol(),
          interval: interval,
          width: width,
          height: height,
          container_id: 'tradingview_chart',
          theme: theme,
          locale: 'tr',
          timezone: 'Europe/Istanbul',
          style: '1',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: false,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'StochasticRSI@tv-basicstudies',
            'Volume@tv-basicstudies',
            'BB@tv-basicstudies'
          ],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          library_path: '/charting_library/',
          fullscreen: false,
          autosize: true,
          details: true,
          withdateranges: true,
          hideideas: true,
        });
      }
    }
  }, [symbol, interval, theme, width, height]);

  return (
    <div className='tradingview-widget-container'>
      <div id='tradingview_chart' />
    </div>
  );
};