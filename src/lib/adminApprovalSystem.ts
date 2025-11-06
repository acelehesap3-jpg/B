// ===========================================
// ADMIN APPROVAL SYSTEM FOR TOKEN PURCHASES
// ===========================================

import { supabase } from '@/integrations/supabase/client';
import { apiConfig } from '@/lib/config/apiConfig';

export interface TokenPurchaseRequest {
  id: string;
  userId: string;
  userEmail: string;
  blockchain: string;
  amount: number;
  currency: string;
  txHash?: string;
  walletAddress: string;
  omniTokensRequested: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  approvedBy?: string;
}

export interface AdminStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalValueProcessed: number;
  totalOmniTokensIssued: number;
}

export class AdminApprovalSystem {
  private readonly OMNI_TOKEN_RATE = 0.01; // 1 OMNI99 = $0.01 USD

  async submitPurchaseRequest(
    userId: string,
    userEmail: string,
    blockchain: string,
    amount: number,
    currency: string,
    txHash?: string
  ): Promise<TokenPurchaseRequest> {
    // Calculate OMNI tokens based on amount and rate
    const omniTokensRequested = amount / this.OMNI_TOKEN_RATE;
    
    // Get the appropriate cold wallet address
    const walletAddress = this.getColdWalletAddress(blockchain);
    
    const request: Omit<TokenPurchaseRequest, 'id' | 'createdAt'> = {
      userId,
      userEmail,
      blockchain,
      amount,
      currency,
      txHash,
      walletAddress,
      omniTokensRequested,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('token_purchase_requests')
      .insert({
        user_id: request.userId,
        user_email: request.userEmail,
        blockchain: request.blockchain,
        amount: request.amount,
        currency: request.currency,
        tx_hash: request.txHash,
        wallet_address: request.walletAddress,
        omni_tokens_requested: request.omniTokensRequested,
        status: request.status,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit purchase request: ${error.message}`);
    }

    return {
      id: data.id,
      ...request,
      createdAt: new Date(data.created_at)
    };
  }

  async getPendingRequests(): Promise<TokenPurchaseRequest[]> {
    const { data, error } = await supabase
      .from('token_purchase_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch pending requests: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToRequest);
  }

  async getAllRequests(limit: number = 100): Promise<TokenPurchaseRequest[]> {
    const { data, error } = await supabase
      .from('token_purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch requests: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToRequest);
  }

  async approveRequest(
    requestId: string,
    adminId: string,
    adminNotes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('token_purchase_requests')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        admin_notes: adminNotes
      })
      .eq('id', requestId);

    if (error) {
      throw new Error(`Failed to approve request: ${error.message}`);
    }

    // Credit OMNI tokens to user's account
    await this.creditOmniTokens(requestId);
  }

  async rejectRequest(
    requestId: string,
    adminId: string,
    adminNotes: string
  ): Promise<void> {
    const { error } = await supabase
      .from('token_purchase_requests')
      .update({
        status: 'rejected',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        admin_notes: adminNotes
      })
      .eq('id', requestId);

    if (error) {
      throw new Error(`Failed to reject request: ${error.message}`);
    }
  }

  private async creditOmniTokens(requestId: string): Promise<void> {
    // Get the request details
    const { data: request, error: requestError } = await supabase
      .from('token_purchase_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error('Request not found');
    }

    // Check if user already has a token balance
    const { data: existingBalance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('*')
      .eq('user_id', request.user_id)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      throw new Error(`Failed to check user balance: ${balanceError.message}`);
    }

    if (existingBalance) {
      // Update existing balance
      const { error: updateError } = await supabase
        .from('user_token_balances')
        .update({
          omni_balance: existingBalance.omni_balance + request.omni_tokens_requested,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', request.user_id);

      if (updateError) {
        throw new Error(`Failed to update user balance: ${updateError.message}`);
      }
    } else {
      // Create new balance record
      const { error: insertError } = await supabase
        .from('user_token_balances')
        .insert({
          user_id: request.user_id,
          omni_balance: request.omni_tokens_requested,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        throw new Error(`Failed to create user balance: ${insertError.message}`);
      }
    }

    // Mark request as completed
    const { error: completeError } = await supabase
      .from('token_purchase_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (completeError) {
      throw new Error(`Failed to mark request as completed: ${completeError.message}`);
    }

    // Log the transaction
    await this.logTokenTransaction(
      request.user_id,
      'credit',
      request.omni_tokens_requested,
      `Token purchase approved - Request ID: ${requestId}`
    );
  }

  private async logTokenTransaction(
    userId: string,
    type: 'credit' | 'debit',
    amount: number,
    description: string
  ): Promise<void> {
    const { error } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        description,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log token transaction:', error);
    }
  }

  async getAdminStats(): Promise<AdminStats> {
    const { data, error } = await supabase
      .from('token_purchase_requests')
      .select('status, amount, omni_tokens_requested');

    if (error) {
      throw new Error(`Failed to fetch admin stats: ${error.message}`);
    }

    const stats = (data || []).reduce(
      (acc, request) => {
        acc.totalRequests++;
        
        switch (request.status) {
          case 'pending':
            acc.pendingRequests++;
            break;
          case 'approved':
          case 'completed':
            acc.approvedRequests++;
            acc.totalValueProcessed += request.amount;
            acc.totalOmniTokensIssued += request.omni_tokens_requested;
            break;
          case 'rejected':
            acc.rejectedRequests++;
            break;
        }
        
        return acc;
      },
      {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalValueProcessed: 0,
        totalOmniTokensIssued: 0
      }
    );

    return stats;
  }

  async getUserTokenBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('user_token_balances')
      .select('omni_balance')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user balance: ${error.message}`);
    }

    return data?.omni_balance || 0;
  }

  async getUserPurchaseHistory(userId: string): Promise<TokenPurchaseRequest[]> {
    const { data, error } = await supabase
      .from('token_purchase_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user purchase history: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToRequest);
  }

  private getColdWalletAddress(blockchain: string): string {
    switch (blockchain.toLowerCase()) {
      case 'bitcoin':
      case 'btc':
        return apiConfig.coldWallets.btc;
      case 'ethereum':
      case 'eth':
        return apiConfig.coldWallets.eth;
      case 'binance-smart-chain':
      case 'bsc':
        return apiConfig.coldWallets.bsc;
      case 'polygon':
      case 'matic':
        return apiConfig.coldWallets.polygon;
      case 'solana':
      case 'sol':
        return apiConfig.coldWallets.solana;
      case 'tron':
      case 'trx':
        return apiConfig.coldWallets.tron;
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  private mapDatabaseToRequest(data: any): TokenPurchaseRequest {
    return {
      id: data.id,
      userId: data.user_id,
      userEmail: data.user_email,
      blockchain: data.blockchain,
      amount: data.amount,
      currency: data.currency,
      txHash: data.tx_hash,
      walletAddress: data.wallet_address,
      omniTokensRequested: data.omni_tokens_requested,
      status: data.status,
      adminNotes: data.admin_notes,
      createdAt: new Date(data.created_at),
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      approvedBy: data.approved_by
    };
  }

  // Blockchain verification methods (simplified - in production, use proper blockchain APIs)
  async verifyTransaction(blockchain: string, txHash: string, expectedAmount: number): Promise<boolean> {
    // This is a simplified verification - in production, you would:
    // 1. Connect to the respective blockchain API
    // 2. Verify the transaction exists
    // 3. Check the amount matches
    // 4. Verify it was sent to the correct cold wallet address
    
    console.log(`Verifying ${blockchain} transaction: ${txHash} for amount: ${expectedAmount}`);
    
    // For demo purposes, return true
    // In production, implement actual blockchain verification
    return true;
  }

  getOmniTokenRate(): number {
    return this.OMNI_TOKEN_RATE;
  }

  getSupportedBlockchains(): string[] {
    const blockchains: string[] = [];
    
    if (apiConfig.coldWallets.btc) blockchains.push('Bitcoin');
    if (apiConfig.coldWallets.eth) blockchains.push('Ethereum');
    if (apiConfig.coldWallets.bsc) blockchains.push('Binance Smart Chain');
    if (apiConfig.coldWallets.polygon) blockchains.push('Polygon');
    if (apiConfig.coldWallets.solana) blockchains.push('Solana');
    if (apiConfig.coldWallets.tron) blockchains.push('Tron');
    
    return blockchains;
  }
}

export const adminApprovalSystem = new AdminApprovalSystem();