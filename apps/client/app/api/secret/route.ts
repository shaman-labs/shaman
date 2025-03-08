import { cookies } from 'next/headers';
import privy from '@/services/privy';
import redis from '@/services/upstash';

interface SecretRequest {
  key: string;
  value: string;
}

export async function POST(req: Request) {
  const { key, value }: SecretRequest = await req.json();
  const authToken = (await cookies()).get('privy-token')?.value;
  if (!authToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const verifiedClaims = await privy.verifyAuthToken(authToken);

  const multi = redis.multi();
  multi.set(`secret:${verifiedClaims.userId}:${key}`, value);
  multi.sadd(`secret:${verifiedClaims.userId}:keys`, key);
  await multi.exec();

  return Response.json({
    success: true,
  });
}

export async function GET() {
  const authToken = (await cookies()).get('privy-token')?.value;
  if (!authToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const verifiedClaims = await privy.verifyAuthToken(authToken);

  const keys = await redis.smembers(`secret:${verifiedClaims.userId}:keys`);

  return Response.json({ keys });
}

export async function DELETE(req: Request) {
  const authToken = (await cookies()).get('privy-token')?.value;
  if (!authToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const verifiedClaims = await privy.verifyAuthToken(authToken);

  const { key }: SecretRequest = await req.json();
  const multi = redis.multi();
  multi.del(`secret:${verifiedClaims.userId}:${key}`);
  multi.srem(`secret:${verifiedClaims.userId}:keys`, key);
  await multi.exec();

  return Response.json({ success: true });
}
