'use client';

import axios from 'axios';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Webhook } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useMUD } from '@/contexts/mud-context';
import { useShamans } from '@/hooks/use-shamans';
import { useSources } from '@/hooks/use-sources';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  network: z.enum(['arbitrumSepolia'], {
    required_error: 'Please select a network',
  }),
  shamanId: z.string().min(1, {
    message: 'Please select a shaman',
  }),
  sourceId: z.string().min(1, {
    message: 'Please select a source',
  }),
});

export default function Page() {
  const mud = useMUD();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [balance, setBalance] = useState(1);
  const { data: shamans, isLoading: shamansLoading } = useShamans();
  const { data: sources, isLoading: sourcesLoading } = useSources();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      network: 'arbitrumSepolia',
      shamanId: '',
      sourceId: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCreating(true);

    try {
      const { data } = await axios.post<{ ipfs: string }>('/api/ipfs', {
        data: {
          name: values.name,
          description: values.description,
        },
      });

      const shamanIds = [values.shamanId as `0x${string}`];
      const sourceIds = [values.sourceId as `0x${string}`];

      await mud?.calls?.embedded?.systemCalls?.createWorkflow(
        BigInt(balance),
        shamanIds,
        sourceIds,
        data.ipfs
      );

      toast({
        title: 'Success!',
        description: 'Your workflow has been created.',
      });

      router.push('/');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
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
                  <BreadcrumbPage>New Workflow</BreadcrumbPage>
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
                  <CardTitle>Create Workflow</CardTitle>
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
                            <FormLabel>Workflow Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter workflow name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Notes about your workflow"
                                rows={5}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sourceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Source</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={sourcesLoading}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a source" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sources.map((source) => (
                                    <SelectItem
                                      key={source.sourceId}
                                      value={source.sourceId}>
                                      {source.name ||
                                        `Source ${source.sourceId.substring(0, 6)}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shamanId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Shaman</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={shamansLoading}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a shaman" />
                                </SelectTrigger>
                                <SelectContent>
                                  {shamans.map((shaman) => (
                                    <SelectItem
                                      key={shaman.shamanId}
                                      value={shaman.shamanId}>
                                      {shaman.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                      <FormItem>
                        <FormLabel>ZUG Balance</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            value={balance}
                            onChange={(e) =>
                              setBalance(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={
                          isCreating || shamansLoading || sourcesLoading
                        }>
                        {isCreating ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Webhook className="ml-2" />
                        )}
                        {isCreating ? 'Creating...' : 'Create Workflow'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Workflow Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Name</h3>
                      <p className="text-sm text-muted-foreground">
                        {form.watch('name') || 'No name specified'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {form.watch('description') ||
                          'No description specified'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Selected Shamans</h3>
                      <div className="flex flex-wrap gap-1">
                        {form.watch('shamanId') ? (
                          <div className="px-2 py-1 bg-secondary rounded-md text-xs">
                            {shamans.find(
                              (s) => s.shamanId === form.watch('shamanId')
                            )?.name || form.watch('shamanId').substring(0, 6)}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No shamans selected
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Selected Sources</h3>
                      <div className="flex flex-wrap gap-1">
                        {form.watch('sourceId') ? (
                          <div className="px-2 py-1 bg-secondary rounded-md text-xs">
                            {sources.find(
                              (s) => s.sourceId === form.watch('sourceId')
                            )?.name || form.watch('sourceId').substring(0, 6)}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No sources selected
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Balance</h3>
                      <p className="text-sm text-muted-foreground">
                        {balance} ZUG
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
