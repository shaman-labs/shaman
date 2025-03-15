'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Save, Webhook } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
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
  BreadcrumbLink,
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useMUD } from '@/contexts/mud-context';
import { useShaman } from '@/hooks/use-shaman';

const formSchema = z.object({
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
});

export default function Page() {
  const mud = useMUD();
  const router = useRouter();
  const params = useParams();
  const shamanId = params.shamanId as string;
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: shaman, isLoading } = useShaman(shamanId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  useEffect(() => {
    if (shaman) {
      form.reset({
        description: shaman.description,
      });
    }
  }, [shaman, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUpdating(true);

    try {
      const { data } = await axios.post<{ ipfs: string }>('/api/ipfs', {
        data: {
          name: shaman?.name,
          description: values.description,
        },
      });

      await mud?.calls?.embedded?.systemCalls?.updateShamanMetadata(
        shamanId as `0x${string}`,
        data.ipfs
      );

      toast({
        title: 'Success!',
        description: 'Your shaman has been updated.',
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
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!shaman) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full items-center justify-center">
            <p>Shaman not found</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
                  <BreadcrumbLink href="/shaman">Shamans</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/shaman/${shamanId}`}>
                    {shaman.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>Update</BreadcrumbPage>
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
                  <CardTitle>Update Shaman</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="space-y-4">
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
                        disabled={isUpdating}>
                        {isUpdating ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Save className="mr-2" />
                        )}
                        {isUpdating ? 'Updating...' : 'Update Shaman'}
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
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Webhook className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Name
                        </h3>
                        <p className="text-sm truncate">
                          {shaman?.name || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Webhook className="h-4 w-4 text-primary" />
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
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
