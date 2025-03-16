import React from 'react';
import { Copy } from 'lucide-react';
import BoringAvatar from 'boring-avatars';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';

interface LabelCreatorProps {
  creator?: string;
  className?: string;
  copyable?: boolean;
}

export const LabelCreator: React.FC<LabelCreatorProps> = ({
  creator,
  className = '',
  copyable = false,
}) => {
  if (!creator) return null;

  if (creator.length <= 6) {
    return <span className={className}>{creator}</span>;
  }

  const start = creator.substring(0, 4);
  const end = creator.substring(creator.length - 4);

  const handleCopy = () => {
    navigator.clipboard.writeText(creator);
    toast({
      title: 'Address copied to clipboard',
    });
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Avatar className="h-4 w-4 rounded-lg mr-2">
        <BoringAvatar name={creator} variant="beam" />
      </Avatar>
      <span>
        {start}...{end}
      </span>
      {copyable && (
        <button onClick={handleCopy} className="ml-2" title="Copy full address">
          <Copy />
        </button>
      )}
    </div>
  );
};
