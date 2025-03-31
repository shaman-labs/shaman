'use client';

import axios from 'axios';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  IconLoader2,
  IconRobot,
  IconFileDescription,
  IconLink,
  IconClock,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { useSources } from '@/hooks/use-sources';
import { Grid, GridItem } from '@/components/grid';
import { handleError } from '@/lib/errors';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  sourceId: z.string().min(1, {
    message: 'Please select a source',
  }),
});

const sourceLabels = {
  'interval-hourly': 'Interval (Hourly)',
  'interval-daily': 'Interval (Daily)',
  'interval-quarter-hourly': 'Interval (Every 15 minutes)',
};

const sourceTTLUnits = {
  'interval-hourly': 1,
  'interval-daily': 24,
  'interval-quarter-hourly': 0.25,
};

const getSourceLabel = (sourceId: string) => {
  return sourceLabels[sourceId as keyof typeof sourceLabels] || sourceId;
};

export default function Page() {
  const mud = useMUD();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [balance, setBalance] = useState(1);
  const { data: sources, isLoading: sourcesLoading } = useSources();

  const calculateTTL = (sourceId: string, balance: number) => {
    if (!sourceId) return '';

    const sourceName = sources.find((s) => s.sourceId === sourceId)?.name || '';
    const multiplier =
      sourceTTLUnits[sourceName as keyof typeof sourceTTLUnits] || 1;
    const hours = balance * multiplier;

    const formattedHours = Number.isInteger(hours) ? hours : hours.toFixed(2);

    return `${formattedHours} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
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

      const abilityIds: `0x${string}`[] = [];
      const sourceIds: `0x${string}`[] = [values.sourceId as `0x${string}`];

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
      handleError(error);
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
                <BreadcrumbItem>
                  <Link href="/shamans" className="text-muted-foreground">
                    Shamans
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>New Shaman</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Grid cols={{ sm: 1, lg: 2 }} gap={4}>
            <GridItem>
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
                              <Input placeholder="Shaman Name" {...field} />
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
                            <FormLabel>Choose Frequency</FormLabel>
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
                                      {getSourceLabel(source.name)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormItem>
                        <FormLabel>Initial ZUG Balance</FormLabel>
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
                        disabled={isCreating || sourcesLoading}>
                        {isCreating ? (
                          <IconLoader2 className="animate-spin" />
                        ) : (
                          <IconRobot className="ml-2" />
                        )}
                        {isCreating ? 'Creating...' : 'Create Shaman'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </GridItem>
            <GridItem>
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <IconRobot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Name
                        </h3>
                        <p className="text-sm truncate">
                          {form.watch('name') || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <IconFileDescription className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Description
                        </h3>
                        <p className="text-sm line-clamp-2">
                          {form.watch('description') || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <IconLink className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Source
                        </h3>
                        <p className="text-sm truncate">
                          {getSourceLabel(
                            sources.find(
                              (s) => s.sourceId === form.watch('sourceId')
                            )?.name || form.watch('sourceId').substring(0, 6)
                          ) || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <IconClock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Estimated Runtime
                        </h3>
                        <p className="text-sm truncate">
                          {calculateTTL(form.watch('sourceId'), balance) || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </GridItem>
          </Grid>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
