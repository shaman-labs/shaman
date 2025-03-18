import { AlertDialogProps } from '@radix-ui/react-alert-dialog';
import { useFundWallet } from '@privy-io/react-auth';
import { useBalance } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDialogContext } from '@/contexts/dialog-context';
import { useEmbeddedWallet } from '@/hooks/use-embedded-wallet';
import { chain } from '@/mud/supportedChains';

export function AlertDialogPaywall(props: AlertDialogProps) {
  const { openBuyZug } = useDialogContext();
  const { fundWallet } = useFundWallet();
  const embeddedWallet = useEmbeddedWallet();
  const { data: balance } = useBalance({
    address: embeddedWallet?.address as `0x${string}`,
  });
  const hasBalance = balance?.value && balance.value > 0n;
  const router = useRouter();
  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasBalance ? 'ZUG balance is required' : 'Fund wallet'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasBalance
              ? 'You need to have a ZUG balance to create a shaman.'
              : 'Your shaman will require balance to execute transactions. You need to fund your shaman wallet to create a shaman.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {hasBalance ? (
            <AlertDialogAction
              onClick={() => {
                router.push('/');

                openBuyZug(true, '/');
              }}>
              Claim ZUG
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={() => {
                router.push('/');

                fundWallet(embeddedWallet?.address || '', {
                  chain: chain as Chain,
                });
              }}>
              Fund wallet
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
