'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Hex, isAddress, zeroAddress } from 'viem';
import { setMembers } from './actions';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
  const [addresses, setAddresses] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const validateAddress = (address: string, index: number) => {
    if (!address) return 'Address is required';
    if (!isAddress(address)) return 'Invalid Ethereum address';
    if (address === zeroAddress) return 'Zero address is not allowed';
    // Check for duplicates excluding the current index
    const isDuplicate = addresses.some(
      (addr, i) => i !== index && addr.toLowerCase() === address.toLowerCase()
    );
    if (isDuplicate) return 'Address already exists';
    return '';
  };

  const handleAddAddress = () => {
    const lastAddress = addresses[addresses.length - 1];
    const error = validateAddress(lastAddress, addresses.length - 1);
    if (error) {
      toast.error(error);
      return;
    }
    setAddresses([...addresses, '']);
  };

  const handleRemoveAddress = (index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(newAddresses.length ? newAddresses : ['']);
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  };

  const handleSubmit = async () => {
    // Remove empty inputs
    const addressesToSubmit = addresses.filter(Boolean);
    if (!addressesToSubmit.length) {
      toast.error('Please add at least one address');
      return;
    }

    // Validate all addresses
    for (let i = 0; i < addressesToSubmit.length; i++) {
      const error = validateAddress(addressesToSubmit[i], i);
      if (error) {
        toast.error(error);
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await setMembers(addressesToSubmit as Hex[]);
      if (response.success) {
        toast.success('Members added successfully');
        setAddresses(['']);
        return;
      }
      toast.error(`Failed to add members: ${response.error}`);
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
            {addresses.length > 1 && (
              <Button
                onClick={() => handleRemoveAddress(index)}
                variant="outline"
                className="text-red-500 hover:text-red-700">
                Remove
              </Button>
            )}
            {index === addresses.length - 1 && (
              <Button onClick={handleAddAddress} variant="outline">
                Add Address
              </Button>
            )}
          </div>
        ))}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !addresses.some(Boolean)}
          className="w-full">
          {isLoading ? 'Processing...' : 'Add Members'}
        </Button>
      </div>
    </div>
  );
}
