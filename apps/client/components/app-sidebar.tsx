'use client';

import * as React from 'react';
import { IconBrandX } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { NavSpells } from '@/components/nav-spells';
import { NavShamans } from '@/components/nav-shamans';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  navSecondary: [
    {
      title: 'Follow us on X',
      url: 'https://x.com/shamandotfun',
      icon: IconBrandX,
    },
    // {
    //   title: 'Documentation',
    //   url: 'https://shamandotfun.notion.site/',
    //   icon: IconBook,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/logo-sm.svg"
                    alt="Small Logo"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-primary font-semibold">
                    Shaman
                  </span>
                  <span className="truncate text-xs">Agentic Oracles</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavShamans />
        <NavSpells />
        <NavSecondary
          items={data.navSecondary}
          className="mt-auto text-primary"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
