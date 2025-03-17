import React from 'react';
import { IconCopy } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';

interface LabelIPFSProps {
  ipfs?: string;
  className?: string;
  copyable?: boolean;
}

export const LabelIPFS: React.FC<LabelIPFSProps> = ({
  ipfs,
  className = '',
  copyable = false,
}) => {
  if (!ipfs) return null;

  if (ipfs.length <= 6) {
    return <span className={className}>{ipfs}</span>;
  }

  const start = ipfs.substring(0, 6);
  const end = ipfs.substring(ipfs.length - 6);

  const handleCopy = () => {
    navigator.clipboard.writeText(ipfs);
    toast({
      title: 'IPFS copied to clipboard',
    });
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {ipfs ? (
        <a
          href={`https://gateway.shaman.fun/ipfs/${ipfs}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 text-sm font-medium truncate block">
          ipfs://{start}...{end}
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">No IPFS link available</p>
      )}
      {copyable && (
        <button onClick={handleCopy} className="ml-2" title="Copy IPFS">
          <IconCopy />
        </button>
      )}
    </div>
  );
};
