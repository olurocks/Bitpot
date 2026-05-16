'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import { useEffect, useRef, useCallback, useState } from 'react';
import { prizePoolAbi } from '@/abi/PrizePool';
import { erc20Abi } from 'viem';
import { Addresses } from '@/config/contracts';

type DepositStatus = 'idle' | 'approving' | 'approved' | 'depositing' | 'success' | 'error';

export function useDeposit(poolAddress: Address) {
  const pendingAmount = useRef<bigint | null>(null);
  const [status, setStatus] = useState<DepositStatus>('idle');

  // Approve
  const { 
    writeContract: writeApprove, 
    data: approveHash,
    error: approveError,
    isPending: isApprovePending 
  } = useWriteContract();

  const { 
    isSuccess: approveSuccess, 
    isError: approveReceiptError 
  } = useWaitForTransactionReceipt({ hash: approveHash });

  // Deposit
  const { 
    writeContract: writeDeposit, 
    data: depositHash,
    error: depositError,
    isPending: isDepositPending 
  } = useWriteContract();

  const { isSuccess: depositSuccess } = useWaitForTransactionReceipt({ 
    hash: depositHash 
  });

  // Initiate deposit flow
  const deposit = useCallback((amount: string) => {
    if (isApprovePending || isDepositPending) return;
    
    const parsed = parseUnits(amount, 18);
    pendingAmount.current = parsed;
    setStatus('approving');

    writeApprove({
      abi: erc20Abi,
      address: Addresses.musd,
      functionName: 'approve',
      args: [poolAddress, parsed],
    });
  }, [poolAddress, isApprovePending, isDepositPending, writeApprove]);

  // Chain: approval confirmed → deposit
  useEffect(() => {
    if (approveSuccess && pendingAmount.current && status === 'approving') {
      setStatus('depositing');
      writeDeposit({
        abi: prizePoolAbi,
        address: poolAddress,
        functionName: 'deposit',
        args: [pendingAmount.current],
      });
    }
  }, [approveSuccess, status, writeDeposit, poolAddress]);

  // Status tracking
  useEffect(() => {
    if (depositSuccess) setStatus('success');
    else if (approveReceiptError || depositError || approveError) setStatus('error');
  }, [depositSuccess, approveReceiptError, depositError, approveError]);

  // Reset for next use
  const reset = useCallback(() => {
    pendingAmount.current = null;
    setStatus('idle');
  }, []);

  return {
    deposit,
    depositHash,
    approveHash,
    status,
    isLoading: isApprovePending || isDepositPending,
    isSuccess: depositSuccess,
    error: approveError || depositError,
    reset,
  };
}