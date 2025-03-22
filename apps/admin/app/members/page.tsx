'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Hex } from 'viem';
import { setMembers } from './actions';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
  const [addresses, setAddresses] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAddress = () => {
    setAddresses([...addresses, '']);
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await setMembers(addresses as Hex[]);
      if (result.success) {
        toast.success('Wallets processed successfully');
        return;
      }
      toast.error(`Failed to process wallets: ${result.error}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Members</h1>
      <div className="space-y-4">
        {addresses.map((address, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => handleAddressChange(index, e.target.value)}
              placeholder="Enter wallet address"
              className="flex-1 p-2 border rounded"
            />
            {index === addresses.length - 1 && (
              <Button onClick={handleAddAddress} variant="outline">
                Add Address
              </Button>
            )}
          </div>
        ))}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || addresses.some((addr) => !addr)}
          className="w-full">
          {isLoading ? 'Processing...' : 'Add Members'}
        </Button>
      </div>
    </div>
  );
}
