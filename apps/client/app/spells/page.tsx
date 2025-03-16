'use client';

import { Eye, Plus } from 'lucide-react';
import Link from 'next/link';
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
import { useSpells } from '@/hooks/use-spells';
import { Grid, GridItem } from '@/components/grid';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { LabelCreator } from '@/components/label-creator';
export default function Page() {
  const { data: spells } = useSpells();

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
                  <Link href="/spells" className="text-muted-foreground">
                    Spells
                  </Link>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
            <GridItem>
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Create New Spell</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Automate and orchestrate your onchain workflows.</p>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm mt-auto">
                  <Button asChild className="w-full" variant="default">
                    <Link href="/spell">
                      <Plus />
                      Create Spell
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </GridItem>
          </Grid>
          <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
            {spells.map((spell) => (
              <GridItem key={spell.spellId}>
                <Card className="mb-4 flex flex-col">
                  <CardHeader>
                    <CardTitle>{spell.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Shaman Count:
                        </span>
                        <span className="text-sm">
                          <code className="rounded-md bg-muted px-1 py-0.5 text-sm overflow-y-auto">
                            <span className="font-mono">
                              {spell.shamanCount}
                            </span>
                          </code>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Created{' '}
                          {formatDistance(
                            new Date(Number(spell.createdAt) * 1000),
                            new Date(),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Created by:</span>
                        <span className="text-sm">
                          <LabelCreator creator={spell.creator} />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm mt-auto">
                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/spell/${spell.spellId}`}>
                        <Eye />
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
