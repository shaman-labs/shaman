import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LabelShamanIdProps {
  shamanId?: string;
  className?: string;
  copyable?: boolean;
}

export const LabelShamanId: React.FC<LabelShamanIdProps> = ({
  shamanId,
  className = '',
  copyable = false,
}) => {
  if (!shamanId) return null;

  if (shamanId.length <= 6) {
    return <span className={className}>{shamanId}</span>;
  }

  const start = shamanId.substring(0, 6);
  const end = shamanId.substring(shamanId.length - 6);

  const handleCopy = () => {
    navigator.clipboard.writeText(shamanId);
    toast({
      title: 'Shaman ID copied to clipboard',
    });
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span>
        {start}...{end}
      </span>
      {copyable && (
        <button onClick={handleCopy} className="ml-2" title="Copy Shaman ID">
          <Copy />
        </button>
      )}
    </div>
  );
};
