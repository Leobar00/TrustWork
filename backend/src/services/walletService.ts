import { ethers } from 'ethers';
import wdkConfig, { validateWdkConfig } from '../config/wdk';

const SIMULATION_MODE = !validateWdkConfig();

class WalletService {
  private provider: ethers.JsonRpcProvider | null = null;
  private escrowABI = [
    'function lockFunds(string taskId) payable',
    'function releaseFunds(string taskId, address recipient, uint256 amount)',
    'function refundFunds(string taskId, address recipient, uint256 amount)',
    'function partialRelease(string taskId, address freelancer, address client, uint256 freelancerAmount, uint256 clientAmount)',
    'function getBalance(string taskId) view returns (uint256)',
    'event FundsLocked(string taskId, uint256 amount, uint256 timestamp)',
    'event FundsReleased(string taskId, address recipient, uint256 amount, uint256 timestamp)',
    'event FundsRefunded(string taskId, address recipient, uint256 amount, uint256 timestamp)',
  ];

  constructor() {
    if (!SIMULATION_MODE) {
      this.provider = new ethers.JsonRpcProvider(wdkConfig.rpcUrl);
    } else {
      console.log('⚠️  WalletService running in SIMULATION MODE');
    }
  }

  async createWallet(): Promise<{ address: string; privateKey: string }> {
    if (SIMULATION_MODE) {
      const mockWallet = ethers.Wallet.createRandom();
      return {
        address: mockWallet.address,
        privateKey: mockWallet.privateKey,
      };
    }

    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  async getBalance(address: string): Promise<string> {
    if (SIMULATION_MODE) {
      return (Math.random() * 1000).toFixed(2);
    }

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get wallet balance');
    }
  }

  async lockFunds(
    clientPrivateKey: string,
    amount: number,
    taskId: string
  ): Promise<{
    txHash: string;
    contractAddress: string;
    status: 'success' | 'failed';
  }> {
    if (SIMULATION_MODE) {
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockContract = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      console.log(`🔒 [SIMULATION] Locking ${amount} USDT for task ${taskId}`);
      console.log(`   Contract: ${mockContract}`);
      console.log(`   TxHash: ${mockTxHash}`);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        txHash: mockTxHash,
        contractAddress: mockContract,
        status: 'success',
      };
    }

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const wallet = new ethers.Wallet(clientPrivateKey, this.provider);
      const contract = new ethers.Contract(wdkConfig.contractAddress, this.escrowABI, wallet);

      const amountInWei = ethers.parseUnits(amount.toString(), 6);

      const tx = await contract.lockFunds(taskId, { value: amountInWei, gasLimit: wdkConfig.gasLimit });

      console.log(`🔒 Locking funds on-chain. TxHash: ${tx.hash}`);

      const receipt = await tx.wait(wdkConfig.confirmations);

      return {
        txHash: receipt.hash,
        contractAddress: wdkConfig.contractAddress,
        status: receipt.status === 1 ? 'success' : 'failed',
      };
    } catch (error: any) {
      console.error('Error locking funds:', error);
      throw new Error(`Failed to lock funds on-chain: ${error.message}`);
    }
  }

  async releasePayment(
    taskId: string,
    freelancerAddress: string,
    amount: number,
    platformPrivateKey: string
  ): Promise<{
    txHash: string;
    status: 'success' | 'failed';
  }> {
    if (SIMULATION_MODE) {
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      console.log(`✅ [SIMULATION] Releasing ${amount} USDT to ${freelancerAddress}`);
      console.log(`   TxHash: ${mockTxHash}`);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        txHash: mockTxHash,
        status: 'success',
      };
    }

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const wallet = new ethers.Wallet(platformPrivateKey, this.provider);
      const contract = new ethers.Contract(wdkConfig.contractAddress, this.escrowABI, wallet);

      const amountInWei = ethers.parseUnits(amount.toString(), 6);

      const tx = await contract.releaseFunds(taskId, freelancerAddress, amountInWei, { gasLimit: wdkConfig.gasLimit });

      console.log(`✅ Releasing payment on-chain. TxHash: ${tx.hash}`);

      const receipt = await tx.wait(wdkConfig.confirmations);

      return {
        txHash: receipt.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
      };
    } catch (error: any) {
      console.error('Error releasing payment:', error);
      throw new Error(`Failed to release payment on-chain: ${error.message}`);
    }
  }

  async refundPayment(
    taskId: string,
    clientAddress: string,
    amount: number,
    platformPrivateKey: string
  ): Promise<{
    txHash: string;
    status: 'success' | 'failed';
  }> {
    if (SIMULATION_MODE) {
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      console.log(`↩️  [SIMULATION] Refunding ${amount} USDT to ${clientAddress}`);
      console.log(`   TxHash: ${mockTxHash}`);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        txHash: mockTxHash,
        status: 'success',
      };
    }

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const wallet = new ethers.Wallet(platformPrivateKey, this.provider);
      const contract = new ethers.Contract(wdkConfig.contractAddress, this.escrowABI, wallet);

      const amountInWei = ethers.parseUnits(amount.toString(), 6);

      const tx = await contract.refundFunds(taskId, clientAddress, amountInWei, { gasLimit: wdkConfig.gasLimit });

      console.log(`↩️  Refunding payment on-chain. TxHash: ${tx.hash}`);

      const receipt = await tx.wait(wdkConfig.confirmations);

      return {
        txHash: receipt.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
      };
    } catch (error: any) {
      console.error('Error refunding payment:', error);
      throw new Error(`Failed to refund payment on-chain: ${error.message}`);
    }
  }

  async partialRelease(
    taskId: string,
    freelancerAddress: string,
    clientAddress: string,
    freelancerPercent: number,
    totalAmount: number,
    platformPrivateKey: string
  ): Promise<{
    txHash: string;
    status: 'success' | 'failed';
  }> {
    const freelancerAmount = (totalAmount * freelancerPercent) / 100;
    const clientAmount = totalAmount - freelancerAmount;

    if (SIMULATION_MODE) {
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      console.log(`⚖️  [SIMULATION] Partial release for task ${taskId}`);
      console.log(`   Freelancer (${freelancerPercent}%): ${freelancerAmount} USDT to ${freelancerAddress}`);
      console.log(`   Client (${100 - freelancerPercent}%): ${clientAmount} USDT to ${clientAddress}`);
      console.log(`   TxHash: ${mockTxHash}`);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        txHash: mockTxHash,
        status: 'success',
      };
    }

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const wallet = new ethers.Wallet(platformPrivateKey, this.provider);
      const contract = new ethers.Contract(wdkConfig.contractAddress, this.escrowABI, wallet);

      const freelancerAmountWei = ethers.parseUnits(freelancerAmount.toString(), 6);
      const clientAmountWei = ethers.parseUnits(clientAmount.toString(), 6);

      const tx = await contract.partialRelease(taskId, freelancerAddress, clientAddress, freelancerAmountWei, clientAmountWei, {
        gasLimit: wdkConfig.gasLimit,
      });

      console.log(`⚖️  Executing partial release on-chain. TxHash: ${tx.hash}`);

      const receipt = await tx.wait(wdkConfig.confirmations);

      return {
        txHash: receipt.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
      };
    } catch (error: any) {
      console.error('Error executing partial release:', error);
      throw new Error(`Failed to execute partial release on-chain: ${error.message}`);
    }
  }

  isSimulationMode(): boolean {
    return SIMULATION_MODE;
  }
}

export default new WalletService();
