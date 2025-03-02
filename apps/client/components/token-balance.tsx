'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';

export function TokenBalance() {
  const [balance, setBalance] = React.useState(0);

  const addBalance = () => {
    // Simulate adding a random amount between 1 and 100
    const amount = Math.floor(Math.random() * 100) + 1;
    setBalance((prevBalance) => prevBalance + amount);
  };

  return (
    <Card className="bg-sidebar-accent">
      <CardContent className="p-2 text-center">
        <p className="text-2xl">{balance} ZUG</p>
      </CardContent>
      <CardFooter className="p-2 pt-0">
        <Button onClick={addBalance} className="w-full">
          Add Balance
        </Button>
      </CardFooter>
    </Card>
  );
}
