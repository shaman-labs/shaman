'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Save, ArrowRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Highlight, themes } from 'prism-react-renderer';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useMUD } from '@/contexts/mud-context';
import { useSpell } from '@/hooks/use-spell';

const formSchema = z.object({
  prompt: z.string().min(16, {
    message: 'Prompt must be at least 16 characters.',
  }),
});

export default function Page() {
  const mud = useMUD();
  const router = useRouter();
  const params = useParams();
  const spellId = params.spellId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [code, setCode] = useState('');
  const [ipfs, setIpfs] = useState('');
  const [ready, setReady] = useState(false);
  const { data: spell, isLoading: isSpellLoading } = useSpell(spellId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  useEffect(() => {
    if (spell) {
      form.reset({
        prompt: spell.prompt,
      });
      setCode(spell.code);
    }
  }, [spell, form]);

  const handleGenerateCode = async (values: z.infer<typeof formSchema>) => {
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
        description: `Your Spell code has been regenerated.`,
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
    if (!ipfs) {
      toast({
        title: 'Error',
        description: 'Please generate code first before updating.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    try {
      await mud?.calls?.embedded?.systemCalls?.updateSpellMetadata(
        spellId as `0x${string}`,
        ipfs
      );

      toast({
        title: 'Success!',
        description: 'Your spell has been updated.',
      });

      router.push(`/spell/${spellId}`);
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

  if (isSpellLoading) {
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

  if (!spell) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full items-center justify-center">
            <p>Spell not found</p>
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
                  <Link href="/spells" className="text-muted-foreground">
                    Spells
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <Link
                    href={`/spell/${spellId}`}
                    className="text-muted-foreground">
                    {spell.name}
                  </Link>
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
                  <CardTitle>Update Spell</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleGenerateCode)}
                      className="space-y-4">
                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spell Interface</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your prompt"
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
                        {isLoading ? 'Generating...' : 'Regenerate Spell Code'}
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
                    onClick={handleUpdate}
                    className="w-full"
                    disabled={isUpdating || !ipfs || !ready}>
                    <Save className="mr-2" />
                    {isUpdating ? 'Updating...' : 'Update Spell'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
