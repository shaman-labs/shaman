'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { IconArrowRight, IconDiamonds } from '@tabler/icons-react';
import { Highlight, themes } from 'prism-react-renderer';
import { useRouter } from 'next/navigation';
import { usePrivy, WalletWithMetadata } from '@privy-io/react-auth';
import Link from 'next/link';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { AppSidebar } from '@/components/app-sidebar';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMUD } from '@/contexts/mud-context';
import { AlertDialogPaywall } from '@/components/alert-dialog-paywall';
import { useZugBalance } from '@/hooks/use-zug-balance';

const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: 'Name is required',
    })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: 'Name can only contain letters, numbers, and dashes',
    }),
  prompt: z.string().min(16, {
    message: 'Prompt must be at least 16 characters.',
  }),
});

export default function Page() {
  const mud = useMUD();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [code, setCode] = useState('');
  const [ipfs, setIpfs] = useState('');
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { ready: privyReady, user, login } = usePrivy();
  const embeddedWallet = user?.linkedAccounts?.find(
    (account) =>
      account.type === 'wallet' && account.connectorType === 'embedded'
  ) as WalletWithMetadata;
  const address = embeddedWallet?.address;
  const {
    data: zugBalance,
    isLoading: isZugBalanceLoading,
    isFetching: isZugBalanceFetching,
  } = useZugBalance(address as `0x${string}`);

  useEffect(() => {
    if (!user) {
      login();
    }
  }, [user, login]);

  useEffect(() => {
    if (
      privyReady &&
      !isZugBalanceLoading &&
      !isZugBalanceFetching &&
      zugBalance === 0n
    ) {
      setOpen(true);
    }
  }, [privyReady, zugBalance, isZugBalanceLoading, isZugBalanceFetching]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      prompt: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setCode('');
    setIpfs('');
    setReady(false);

    try {
      const response = await fetch('/api/spell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: values.prompt,
        }),
      });

      const json = await response.json();
      setCode(json.code);
      setIpfs(json.ipfs);
      setReady(json.ready);

      toast({
        title: 'Success!',
        description: `Your Spell has been created.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);

    try {
      await mud?.calls?.embedded?.systemCalls?.createSpell(
        form.getValues('name'),
        ipfs
      );

      toast({
        title: 'Success!',
        description: 'Your Spell has been deployed.',
      });

      router.push(`/`);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

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
                  <BreadcrumbPage>New Spell</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create Spell</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (unique slug)</FormLabel>
                            <FormControl>
                              <Input placeholder="unique-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spell Interface</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your prompt here"
                                rows={18}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Generate Spell Code'}
                        <IconArrowRight />
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Spell Code</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  {code ? (
                    <div className="flex flex-col h-full">
                      <Highlight
                        theme={themes.nightOwl}
                        code={code}
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
                  ) : isLoading ? (
                    <div className="flex-1 flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Generating code...
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        No code generated yet.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-row items-center justify-end mt-auto space-x-3">
                  <Button
                    onClick={handleDeploy}
                    className="w-full"
                    disabled={isDeploying || !code || !ready}>
                    <IconDiamonds />
                    {isDeploying ? 'Deploying...' : 'Deploy Spell'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
      <AlertDialogPaywall open={open} onOpenChange={setOpen} />
    </SidebarProvider>
  );
}
