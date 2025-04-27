'use client';

import { useAsciiText, alligator } from 'react-ascii-text';
import { IconEye, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { formatDistance } from 'date-fns';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useShamans } from '@/hooks/use-shamans';
import { Grid, GridItem } from '@/components/grid';
import { LabelCreator } from '@/components/label-creator';
import {
  BreadcrumbItem,
  BreadcrumbList,
  Breadcrumb,
} from '@/components/ui/breadcrumb';

export default function Page() {
  const { data: shamans } = useShamans();
  const { user, login } = usePrivy();
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
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link href="/shamans" className="text-muted-foreground">
                    Shamans
                  </Link>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {user ? (
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
              <GridItem>
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Create New Workflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Automate and orchestrate your onchain workflows.</p>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm mt-auto">
                    <Button asChild className="w-full" variant="default">
                      <Link href="/shaman">
                        <IconPlus />
                        Create Shaman
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </GridItem>
            </Grid>
            <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
              {shamans.map((shaman) => (
                <GridItem key={shaman.shamanId}>
                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{shaman.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Balance:</span>
                          <span className="text-sm">
                            <code className="rounded-md bg-muted px-1 py-0.5 text-sm overflow-y-auto">
                              <span className="font-mono">
                                {shaman.balance}
                              </span>
                            </code>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Created{' '}
                            {formatDistance(
                              new Date(Number(shaman.createdAt) * 1000),
                              new Date(),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Created by
                          </span>
                          <span className="text-sm">
                            <LabelCreator creator={shaman.creator} />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm mt-auto">
                      <Button asChild className="w-full" variant="outline">
                        <Link href={`/shaman/${shaman.shamanId}`}>
                          <IconEye />
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </div>
        ) : (
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
              <Button onClick={login} size="lg" className="mt-6">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
