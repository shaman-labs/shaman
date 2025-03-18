import { SyncStep } from '@latticexyz/store-sync';
import { useAsciiText, alligator } from 'react-ascii-text';
import { usePrivy } from '@privy-io/react-auth';
import { useMUDProgress } from '@/hooks/use-mud-progress';

export function LoadingProgress({ children }: { children: React.ReactNode }) {
  const { progress } = useMUDProgress();
  const { ready } = usePrivy();
  const asciiTextRef = useAsciiText({
    font: alligator,
    text: 'Shaman',
  });

  if (progress?.step === SyncStep.LIVE && ready) {
    return children;
  }

  return (
    <div className="flex h-screen w-screen bg-background">
      <div className="flex flex-col items-center justify-center gap-2 m-auto">
        <div className="self-center">
          <div className="text-[6px] sm:text-[8px] md:text-[10px] lg:text-sm">
            <pre
              className="w-full"
              ref={asciiTextRef as React.RefObject<HTMLPreElement>}
            />
          </div>
        </div>
        <p className="w-full text-center text-xs">
          {Math.floor(progress?.percentage ? Number(progress?.percentage) : 0)}%
        </p>
        <p className="w-full text-center text-xs">
          {progress?.message ?? 'Loading...'}
        </p>
      </div>
    </div>
  );
}
