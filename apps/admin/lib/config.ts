export const CHAIN_ID = process.env.CHAIN_ID ?? 421614;
export const RPC_URL =
  process.env.RPC_URL ??
  'https://arb-sepolia.g.alchemy.com/v2/BD6ubWpQ9wIUF1J9g9uOc1bTRsSQObYu';
export const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY ?? '';

if (!ADMIN_PRIVATE_KEY) {
  throw new Error('ADMIN_PRIVATE_KEY must be set');
}
