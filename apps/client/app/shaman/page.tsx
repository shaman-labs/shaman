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
import { toast } from '@/hooks/use-toast';
import { useMUD } from '@/contexts/mud-context';
import { Grid, GridItem } from '@/components/grid';
import { handleError } from '@/lib/errors';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
});

export default function Page() {
  const mud = useMUD();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
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

      await mud?.calls?.embedded?.systemCalls?.createShaman(
        values.name,
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
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={isCreating}>
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
