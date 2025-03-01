'use client';

import { User, Calendar, Hash, FileCode, Link } from 'lucide-react';
import { themes } from 'prism-react-renderer';
import { Highlight } from 'prism-react-renderer';
import { useParams } from 'next/navigation';
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
import { useShaman } from '@/hooks/use-shaman';

export default function Page() {
  const { shamanId } = useParams();
  const { data: shaman } = useShaman(shamanId as string);

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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage className="text-xs">
                    {shamanId}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <Card className="pt-6">
                <CardContent className="flex-grow space-y-4">
                  <div className="grid gap-6 divide-y divide-border">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <FileCode className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Name
                        </h3>
                        <p className="text-base font-semibold">
                          {shaman?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Creator
                        </h3>
                        <p className="font-mono text-sm truncate">
                          {shaman?.creator}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Created
                        </h3>
                        <p className="text-sm">
                          {shaman?.createdAt
                            ? new Date(
                                Number(shaman.createdAt) * 1000
                              ).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Hash className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Workflow Count
                        </h3>
                        <p className="text-sm font-medium">
                          {shaman?.workflowCount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Link className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          IPFS Link
                        </h3>
                        {shaman?.metadata ? (
                          <a
                            href={`https://gateway.shaman.fun/ipfs/${shaman.metadata}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-sm font-medium truncate block">
                            ipfs://{shaman.metadata}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No IPFS link available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-4">
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
                          code={shaman?.prompt || ''}
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
                          code={shaman?.code || ''}
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
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
