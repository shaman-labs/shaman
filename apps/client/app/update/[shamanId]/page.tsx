'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, Webhook } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { useRouter, useParams } from 'next/navigation';
import { usePrivy, WalletWithMetadata } from '@privy-io/react-auth';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMUD } from '@/contexts/mud-context';
import { AlertDialogPaywall } from '@/components/alert-dialog-paywall';
import { useZugBalance } from '@/hooks/use-zug-balance';
import { useShaman } from '@/hooks/use-shaman';

const formSchema = z.object({
  prompt: z.string().min(16, {
    message: 'Prompt must be at least 16 characters.',
  }),
  network: z.enum(['arbitrumSepolia'], {
    required_error: 'Please select a network',
  }),
});

export default function Page() {
  const { shamanId } = useParams();
  const { data: existingShaman, isLoading: isLoadingShaman } = useShaman(
    shamanId as string
  );
  const mud = useMUD();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [code, setCode] = useState('');
  const [ipfs, setIpfs] = useState('');
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { ready: privyReady, user } = usePrivy();
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
      prompt: '',
      network: 'arbitrumSepolia',
    },
  });

  useEffect(() => {
    if (existingShaman) {
      form.reset({
        prompt: existingShaman.prompt || '',
        network: 'arbitrumSepolia',
      });
      setCode(existingShaman.code || '');
      setIpfs(existingShaman.metadata || '');
      setReady(true);
    }
  }, [existingShaman, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setCode('');
    setIpfs('');
    setReady(false);

    try {
      const response = await fetch('/api/shaman', {
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
        description: `Your Shaman code has been generated.`,
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

  const handleUpdate = async () => {
    setIsDeploying(true);

    try {
      await mud?.calls?.embedded?.systemCalls?.updateShamanMetadata(
        shamanId as `0x${string}`,
        ipfs
      );

      toast({
        title: 'Success!',
        description: 'Your Shaman has been updated.',
      });

      router.push(`/shaman/${shamanId}`);
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>Update Shaman</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {isLoadingShaman ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading shaman data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Update Shaman</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4">
                        <FormField
                          control={form.control}
                          name="prompt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shaman Interface</FormLabel>
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
                        <FormField
                          control={form.control}
                          name="network"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Network</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select network" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="arbitrumSepolia">
                                    Arbitrum Sepolia (Testnet)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          className="w-full"
                          type="submit"
                          disabled={isLoading}>
                          {isLoading ? 'Generating...' : 'Update Shaman Code'}
                          <ArrowRight />
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
              <div className="flex flex-col gap-4">
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Shaman Code</CardTitle>
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
                      onClick={handleUpdate}
                      className="w-full"
                      disabled={isDeploying || !code || !ready}>
                      <Webhook />
                      {isDeploying ? 'Updating...' : 'Update Shaman'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
      <AlertDialogPaywall open={open} onOpenChange={setOpen} />
    </SidebarProvider>
  );
}
