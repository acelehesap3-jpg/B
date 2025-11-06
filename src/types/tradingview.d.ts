declare module 'react-tradingview-widget' {
  export type ResolutionString = 
    | '1' 
    | '5' 
    | '15' 
    | '30' 
    | '60' 
    | '240' 
    | 'D' 
    | 'W' 
    | 'M';

  export interface TradingViewWidgetProps {
    symbol?: string;
    interval?: ResolutionString;
    timezone?: string;
    theme?: string;
    style?: string;
    locale?: string;
    toolbar_bg?: string;
    enable_publishing?: boolean;
    allow_symbol_change?: boolean;
    container_id?: string;
    withdateranges?: boolean;
    hide_side_toolbar?: boolean;
    studies?: string[];
    show_popup_button?: boolean;
    popup_width?: string;
    popup_height?: string;
    autosize?: boolean;
    height?: number;
    width?: number;
  }

  export class TradingViewWidget extends React.Component<TradingViewWidgetProps> {}
}