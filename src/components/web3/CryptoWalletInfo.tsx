import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet,
  Link,
  CreditCard,
  History,
  AlertTriangle
} from 'lucide-react';

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  ensName?: string;
}

export const CryptoWalletInfo = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask veya başka bir Web3 cüzdan gerekli!');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = ethers.formatEther(await provider.getBalance(address));
      const network = (await provider.getNetwork()).name;
      let ensName;

      try {
        ensName = await provider.lookupAddress(address);
      } catch (err) {
        console.warn('ENS lookup failed:', err);
      }

      setWalletInfo({
        address,
        balance,
        network,
        ensName
      });
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Cüzdan bağlantısında hata oluştu!');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    // Cüzdan durumu değişikliklerini dinle
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      window.ethereum.on('disconnect', () => {
        setWalletInfo(null);
      });
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Kripto Cüzdan</span>
        </CardTitle>
        <CardDescription>
          DeFi işlemleri için cüzdanınızı bağlayın
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-600 text-sm flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {!walletInfo ? (
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Bağlanıyor...' : 'Cüzdan Bağla'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-500 flex items-center space-x-1">
                  <Link className="h-4 w-4" />
                  <span>Adres</span>
                </label>
                <p className="text-sm font-mono">
                  {walletInfo.ensName || `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`}
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm text-gray-500 flex items-center space-x-1">
                  <CreditCard className="h-4 w-4" />
                  <span>Bakiye</span>
                </label>
                <p className="text-sm">
                  {parseFloat(walletInfo.balance).toFixed(4)} ETH
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <History className="h-3 w-3" />
                <span>{walletInfo.network}</span>
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWalletInfo(null)}
              >
                Bağlantıyı Kes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};