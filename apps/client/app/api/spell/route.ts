import { generateObject } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { anthropic } from '@ai-sdk/anthropic';
import { getSystemPrompt } from '@/prompts/system';
import { objectManager } from '@/services/filebase';
import privy from '@/services/privy';

interface SpellRequest {
  prompt: string;
  network: string;
  frequency: string;
  duration: number;
}

export async function POST(req: Request) {
  const { prompt }: SpellRequest = await req.json();
  const authToken = (await cookies()).get('privy-token')?.value;
  if (!authToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const verifiedClaims = await privy.verifyAuthToken(authToken);

  const system = getSystemPrompt();

  const executable = await generateObject({
    model: anthropic('claude-3-7-sonnet-20250219'),
    system,
    prompt,
    schema: z.object({
      code: z.string().describe('The code to be executed.'),
    }),
  });

  const metadata = {
    prompt,
    creatorId: verifiedClaims.userId,
    code: Buffer.from(executable.object.code, 'utf-8').toString('base64'),
    createdAt: new Date().toISOString(),
  };

  const upload = await objectManager.upload(
    uuidv4(),
    Buffer.from(JSON.stringify(metadata)),
    null,
    null
  );

  return Response.json({
    code: executable.object.code,
    ipfs: upload.cid,
    metadata,
  });
}
