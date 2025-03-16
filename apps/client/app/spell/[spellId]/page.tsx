'use client';

import {
  User,
  Calendar,
  Hash,
  FileCode,
  Link as LinkIcon,
  DollarSign,
} from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpell } from '@/hooks/use-spell';
import { Grid, GridItem } from '@/components/grid';
import { RowItem } from '@/components/row-item';
import { LabelCreator } from '@/components/label-creator';

export default function Page() {
  const { spellId } = useParams();
  const { data: spell } = useSpell(spellId as string);

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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>{spell?.name || spellId}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Grid cols={{ sm: 1, lg: 2 }} gap={4}>
            <GridItem className="order-last md:order-first">
              <Card className="pt-6">
                <CardContent className="flex-grow space-y-4">
                  <div className="grid gap-6 divide-y divide-border">
                    <RowItem icon={FileCode} label="Name" noDivider>
                      <p className="text-base font-semibold">{spell?.name}</p>
                    </RowItem>

                    <RowItem icon={User} label="Creator">
                      <div className="text-sm font-small">
                        <LabelCreator creator={spell?.creator} />
                      </div>
                    </RowItem>

                    <RowItem icon={Hash} label="Shamans Count">
                      <p className="text-sm font-medium">
                        {spell?.shamanCount}
                      </p>
                    </RowItem>

                    <RowItem icon={DollarSign} label="Commission Revenue">
                      <p className="text-sm font-medium">0 ZUG</p>
                    </RowItem>

                    <RowItem icon={LinkIcon} label="IPFS Link">
                      {spell?.metadata ? (
                        <a
                          href={`https://gateway.shaman.fun/ipfs/${spell.metadata}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 text-sm font-medium truncate block w-full overflow-hidden">
                          ipfs://{spell.metadata}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No IPFS link available
                        </p>
                      )}
                    </RowItem>

                    <RowItem icon={Calendar} label="Created">
                      <p className="text-sm">
                        {spell?.createdAt
                          ? new Date(
                              Number(spell.createdAt) * 1000
                            ).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : ''}
                      </p>
                    </RowItem>
                  </div>
                </CardContent>
              </Card>
            </GridItem>
            <GridItem className="order-first md:order-last">
              <Card className="pt-6">
                <CardContent className="flex-1 min-h-0 max-w-full w-full">
                  <Tabs defaultValue="prompt" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="prompt">Prompt</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                    </TabsList>
                    <TabsContent value="prompt">
                      <div className="flex flex-col h-full w-full">
                        <Highlight
                          theme={themes.nightOwl}
                          code={spell?.prompt || ''}
                          language="markdown">
                          {({ style, tokens, getLineProps, getTokenProps }) => (
                            <pre
                              className="w-full p-4 text-sm whitespace-pre-wrap"
                              style={{ ...style, maxWidth: '100%' }}>
                              {tokens.map((line, i) => (
                                <div
                                  key={i}
                                  {...getLineProps({ line })}
                                  className="whitespace-pre-wrap">
                                  {line.map((token, key) => (
                                    <span
                                      key={key}
                                      {...getTokenProps({ token })}
                                    />
                                  ))}
                                </div>
                              ))}
                            </pre>
                          )}
                        </Highlight>
                      </div>
                    </TabsContent>
                    <TabsContent value="code">
                      <div className="flex flex-col h-full w-full">
                        <Highlight
                          theme={themes.nightOwl}
                          code={spell?.code || ''}
                          language="tsx">
                          {({ style, tokens, getLineProps, getTokenProps }) => (
                            <pre
                              className="overflow-x-auto w-full p-4 text-sm whitespace-pre"
                              style={{ ...style, maxWidth: '100%' }}>
                              {tokens.map((line, i) => (
                                <div
                                  key={i}
                                  {...getLineProps({ line })}
                                  className="whitespace-pre">
                                  {line.map((token, key) => (
                                    <span
                                      key={key}
                                      {...getTokenProps({ token })}
                                    />
                                  ))}
                                </div>
                              ))}
                            </pre>
                          )}
                        </Highlight>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </GridItem>
          </Grid>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
