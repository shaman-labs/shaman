import { cookies } from 'next/headers';
import { WalletWithMetadata } from '@privy-io/server-auth';
import privy from '@/services/privy';
import redis from '@/services/upstash';

interface SecretRequest {
  key: string;
  value: string;
}

export async function POST(req: Request) {
  const { key, value }: SecretRequest = await req.json();
  const cookiesStore = await cookies();
  const idToken = cookiesStore.get('privy-id-token')?.value;
  if (!idToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await privy.getUser({
    idToken: idToken,
  });

  const embeddedWallet = user.linkedAccounts.find(
    (account) =>
      account.type === 'wallet' && account.walletClientType === 'privy'
  ) as WalletWithMetadata;

  if (!embeddedWallet) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const multi = redis.multi();
  multi.set(`secret:${embeddedWallet.address.toLowerCase()}:${key}`, value);
  multi.sadd(`secret:${embeddedWallet.address.toLowerCase()}:keys`, key);
  await multi.exec();

  return Response.json({
    success: true,
  });
}

export async function GET() {
  const cookiesStore = await cookies();
  const idToken = cookiesStore.get('privy-id-token')?.value;
  if (!idToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await privy.getUser({
    idToken: idToken,
  });

  const embeddedWallet = user.linkedAccounts.find(
    (account) =>
      account.type === 'wallet' && account.walletClientType === 'privy'
  ) as WalletWithMetadata;

  if (!embeddedWallet) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = await redis.smembers(
    `secret:${embeddedWallet.address.toLowerCase()}:keys`
  );

  return Response.json({ keys });
}

export async function DELETE(req: Request) {
  const cookiesStore = await cookies();
  const idToken = cookiesStore.get('privy-id-token')?.value;
  if (!idToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await privy.getUser({
    idToken: idToken,
  });

  const embeddedWallet = user.linkedAccounts.find(
    (account) =>
      account.type === 'wallet' && account.walletClientType === 'privy'
  ) as WalletWithMetadata;

  if (!embeddedWallet) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { key }: SecretRequest = await req.json();
  const multi = redis.multi();
  multi.del(`secret:${embeddedWallet.address.toLowerCase()}:${key}`);
  multi.srem(`secret:${embeddedWallet.address.toLowerCase()}:keys`, key);
  await multi.exec();

  return Response.json({ success: true });
}
