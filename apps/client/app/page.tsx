'use client';

import { useAsciiText, alligator } from 'react-ascii-text';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function Page() {
  const { user, login } = usePrivy();
  const router = useRouter();
  const asciiTextRef = useAsciiText({
    font: alligator,
    text: 'Shaman',
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex justify-center items-center h-full">
          <div className="flex flex-col p-4 w-full justify-center items-center">
            <div className="text-[6px] sm:text-[8px] md:text-[10px] lg:text-sm">
              <pre
                className="w-full"
                ref={asciiTextRef as React.RefObject<HTMLPreElement>}></pre>
            </div>
            <p className="mt-6 text-center">
              Automate your onchain workflows with shaman.
            </p>
            <Button
              onClick={user ? () => router.push('/shamans') : login}
              size="lg"
              className="mt-6">
              Get Started
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
