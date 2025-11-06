import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  Shield,
  Zap,
  Star,
  MessageSquare,
  Settings,
  RefreshCw
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    signals: string[];
  };
}

interface MarketAnalysis {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  signals: string[];
  recommendation: string;
}

const TradingAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Merhaba! Ben OMNI AI Trading Asistanınızım. Size piyasa analizi, risk yönetimi ve trading stratejileri konularında yardımcı olabilirim. Hangi konuda yardıma ihtiyacınız var?',
      timestamp: new Date(),
      analysis: {
        sentiment: 'neutral',
        confidence: 100,
        signals: ['AI Assistant Ready', 'Market Analysis Available', 'Risk Management Active']
      }
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-free');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulated AI responses based on trading context
  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let analysis: Message['analysis'] = {
      sentiment: 'neutral',
      confidence: 75,
      signals: []
    };

    // Market analysis responses
    if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
      response = `Bitcoin analizi:

📈 **Teknik Analiz:**
- RSI: 65.2 (Nötr bölge)
- MACD: Pozitif momentum
- Bollinger Bands: Üst banda yaklaşıyor

🎯 **Öneriler:**
- Kısa vadeli: Dikkatli yaklaşım
- Destek seviyesi: $42,800
- Direnç seviyesi: $45,200

⚠️ **Risk Uyarısı:** Yüksek volatilite bekleniyor`;
      
      analysis = {
        sentiment: 'bullish',
        confidence: 78,
        signals: ['RSI Neutral', 'MACD Positive', 'High Volatility Expected']
      };
    }
    else if (lowerMessage.includes('eth') || lowerMessage.includes('ethereum')) {
      response = `Ethereum analizi:

📊 **Piyasa Durumu:**
- Fiyat: $2,650 (+2.3%)
- Hacim: Artış eğiliminde
- DeFi TVL: Stabil

🔍 **Teknik Göstergeler:**
- EMA 20/50: Golden cross yakın
- Stochastic: Aşırı alım bölgesinde
- Volume Profile: Güçlü destek

💡 **Strateji Önerisi:** Kademeli alım stratejisi uygulayın`;
      
      analysis = {
        sentiment: 'bullish',
        confidence: 82,
        signals: ['Golden Cross Near', 'Strong Support', 'DeFi TVL Stable']
      };
    }
    else if (lowerMessage.includes('risk') || lowerMessage.includes('riski')) {
      response = `Risk Yönetimi Önerileri:

🛡️ **Temel Kurallar:**
1. Portföyünüzün %2'sinden fazlasını riske atmayın
2. Stop-loss emirlerini mutlaka kullanın
3. Çeşitlendirme yapın (en az 5-8 farklı coin)

📊 **Risk/Ödül Oranı:**
- Minimum 1:2 oranını hedefleyin
- Kayıp limitinizi önceden belirleyin
- Duygusal kararlar almayın

⚡ **Acil Durum Planı:**
- %10 kayıpta pozisyonu gözden geçirin
- %20 kayıpta kısmi satış yapın
- Piyasa koşullarını sürekli takip edin`;
      
      analysis = {
        sentiment: 'neutral',
        confidence: 95,
        signals: ['Risk Management Active', 'Stop Loss Required', 'Diversification Needed']
      };
    }
    else if (lowerMessage.includes('strateji') || lowerMessage.includes('strategy')) {
      response = `Trading Stratejileri:

🎯 **Scalping (Kısa Vadeli):**
- Zaman dilimi: 1-5 dakika
- Hedef kar: %0.5-2
- Risk seviyesi: Yüksek

📈 **Swing Trading (Orta Vadeli):**
- Zaman dilimi: 1-7 gün
- Hedef kar: %5-15
- Risk seviyesi: Orta

💎 **HODLing (Uzun Vadeli):**
- Zaman dilimi: 6 ay - 2 yıl
- Hedef kar: %50-500
- Risk seviyesi: Düşük

🤖 **DCA (Dollar Cost Averaging):**
- Düzenli alım stratejisi
- Volatiliteden korunma
- Uzun vadeli birikim`;
      
      analysis = {
        sentiment: 'neutral',
        confidence: 88,
        signals: ['Multiple Strategies Available', 'Risk Levels Vary', 'Time Frame Important']
      };
    }
    else if (lowerMessage.includes('piyasa') || lowerMessage.includes('market')) {
      response = `Genel Piyasa Analizi:

📊 **Mevcut Durum:**
- Bitcoin Dominansı: %52.3
- Total Market Cap: $1.68T
- Fear & Greed Index: 67 (Açgözlülük)

🌍 **Makro Faktörler:**
- Fed faiz kararları yaklaşıyor
- Kurumsal yatırımcı ilgisi artıyor
- Regülasyon belirsizlikleri devam ediyor

🔮 **Kısa Vadeli Beklenti:**
- Volatilite artabilir
- Alt coinlerde hareket bekleniyor
- Hacim artışına dikkat edin`;
      
      analysis = {
        sentiment: 'neutral',
        confidence: 72,
        signals: ['High Greed Index', 'Institutional Interest', 'Regulatory Uncertainty']
      };
    }
    else {
      // Generic helpful response
      response = `Anladım! Size şu konularda yardımcı olabilirim:

🔍 **Piyasa Analizi:**
- "BTC analizi yap" veya "ETH durumu nasıl?"
- Teknik göstergeler ve fiyat tahminleri

📊 **Risk Yönetimi:**
- "Risk yönetimi önerileri"
- Portföy çeşitlendirme stratejileri

💡 **Trading Stratejileri:**
- "Hangi stratejiyi kullanayım?"
- Scalping, swing trading, DCA önerileri

🌍 **Genel Piyasa:**
- "Piyasa durumu nasıl?"
- Makro ekonomik faktörler

Hangi konuda detaylı bilgi almak istiyorsunuz?`;
      
      analysis = {
        sentiment: 'neutral',
        confidence: 90,
        signals: ['AI Ready', 'Multiple Services Available', 'Ask Specific Questions']
      };
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      analysis
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Üzgünüm, şu anda bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date(),
        analysis: {
          sentiment: 'neutral',
          confidence: 0,
          signals: ['Error Occurred']
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'BTC analizi yap',
    'Risk yönetimi önerileri',
    'Hangi stratejiyi kullanayım?',
    'Piyasa durumu nasıl?',
    'ETH için öneriler',
    'Altcoin önerileri'
  ];

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" />
            OMNI AI Trading Asistanı
            <Badge variant="outline" className="ml-auto">
              <Brain className="h-3 w-3 mr-1" />
              {selectedModel === 'gemini-free' ? 'Gemini Free' : 'GPT-3.5'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Yapay zeka destekli piyasa analizi, risk yönetimi ve trading önerileri
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold">Sohbet</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {message.analysis && (
                        <div className="flex items-center gap-1">
                          {message.analysis.sentiment === 'bullish' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {message.analysis.sentiment === 'bearish' && <TrendingDown className="h-3 w-3 text-red-500" />}
                          {message.analysis.sentiment === 'neutral' && <Activity className="h-3 w-3 text-gray-500" />}
                          <span>{message.analysis.confidence}%</span>
                        </div>
                      )}
                    </div>
                    {message.analysis && message.analysis.signals.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.analysis.signals.map((signal, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {signal}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="text-sm">AI düşünüyor...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          {/* Quick Questions */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Piyasa analizi, risk yönetimi veya strateji hakkında soru sorun..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsListening(!isListening)}
                className={isListening ? 'bg-red-100' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Piyasa Analizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Teknik analiz, trend tespiti ve fiyat tahminleri
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Analiz Doğruluğu</span>
                <span className="text-green-600">78%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Günlük Analiz</span>
                <span>24/7</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              Risk Yönetimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Portföy koruması ve risk analizi
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Risk Skoru</span>
                <span className="text-yellow-600">Orta</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Öneriler</span>
                <span>Aktif</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Strateji Önerileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Kişiselleştirilmiş trading stratejileri
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Aktif Strateji</span>
                <span>DCA + Swing</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Başarı Oranı</span>
                <span className="text-green-600">85%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradingAIAssistant;