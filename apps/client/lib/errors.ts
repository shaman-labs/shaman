import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  TransactionExecutionError,
} from 'viem';
import { toast } from '@/hooks/use-toast';

export function handleError(err: unknown) {
  if (err instanceof BaseError) {
    const error = err.walk();

    if (error instanceof ContractFunctionRevertedError) {
      showError(error, error.data?.args?.toString() ?? 'unknown error');
      return;
    }
    const isInsufficientFundsError = err.walk(
      (e) => e instanceof InsufficientFundsError
    );
    if (isInsufficientFundsError) {
      showError(
        isInsufficientFundsError,
        "You don't have enough ETH to complete this action."
      );
      return;
    }
    const txError = err.walk((e) => e instanceof TransactionExecutionError);

    if (txError instanceof TransactionExecutionError) {
      showError(txError, txError.shortMessage ?? 'unknown error');
      return;
    }
  }

  showError(err as Error, (err as Error).message || 'unknown error');
}

function showError(error: Error, message: string) {
  console.log(error);

  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
}
