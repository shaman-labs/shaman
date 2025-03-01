import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { objectManager } from '@/services/filebase';
import privy from '@/services/privy';

interface IPFSRequest {
  data: Record<string, any>;
}

export async function POST(req: Request) {
  const { data }: IPFSRequest = await req.json();
  const authToken = (await cookies()).get('privy-token')?.value;
  if (!authToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await privy.verifyAuthToken(authToken);

  const upload = await objectManager.upload(
    uuidv4(),
    Buffer.from(JSON.stringify(data)),
    null,
    null
  );

  return Response.json({
    ipfs: upload.cid,
  });
}
