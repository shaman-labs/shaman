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
import { useAbilities } from '@/hooks/use-abilities';
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
  abilityId: z.string().min(1, {
    message: 'Please select an ability',
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
  const { data: abilities, isLoading: abilitiesLoading } = useAbilities();
  const { data: sources, isLoading: sourcesLoading } = useSources();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      network: 'arbitrumSepolia',
      abilityId: '',
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

      const abilityIds = [values.abilityId as `0x${string}`];
      const sourceIds = [values.sourceId as `0x${string}`];

      await mud?.calls?.embedded?.systemCalls?.createShaman(
        BigInt(balance),
        values.name,
        abilityIds,
        sourceIds,
        data.ipfs
      );

      toast({
        title: 'Success!',
        description: 'Your shaman has been created.',
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
                  <BreadcrumbPage>New Shaman</BreadcrumbPage>
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
                  <CardTitle>Create Shaman</CardTitle>
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
                            <FormLabel>Shaman Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter shaman name"
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
                                placeholder="Notes about your shaman"
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
                        name="abilityId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Ability</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={abilitiesLoading}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an ability" />
                                </SelectTrigger>
                                <SelectContent>
                                  {abilities.map((ability) => (
                                    <SelectItem
                                      key={ability.abilityId}
                                      value={ability.abilityId}>
                                      {ability.name}
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
                          isCreating || abilitiesLoading || sourcesLoading
                        }>
                        {isCreating ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Webhook className="ml-2" />
                        )}
                        {isCreating ? 'Creating...' : 'Create Shaman'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Shaman Preview</CardTitle>
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
                      <h3 className="text-sm font-medium">Selected Ability</h3>
                      <div className="flex flex-wrap gap-1">
                        {form.watch('abilityId') ? (
                          <div className="px-2 py-1 bg-secondary rounded-md text-xs">
                            {abilities.find(
                              (a) => a.abilityId === form.watch('abilityId')
                            )?.name || form.watch('abilityId').substring(0, 6)}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No ability selected
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Selected Source</h3>
                      <div className="flex flex-wrap gap-1">
                        {form.watch('sourceId') ? (
                          <div className="px-2 py-1 bg-secondary rounded-md text-xs">
                            {sources.find(
                              (s) => s.sourceId === form.watch('sourceId')
                            )?.name || form.watch('sourceId').substring(0, 6)}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No source selected
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
