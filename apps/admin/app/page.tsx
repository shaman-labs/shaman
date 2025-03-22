'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shaman Admin</h1>
        <Button asChild>
          <Link href="/members">Add Members</Link>
        </Button>
      </div>
    </div>
  );
}
