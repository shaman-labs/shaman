import { GoldRushClient } from '@covalenthq/client-sdk';

const client = new GoldRushClient(process.env.NEXT_PUBLIC_COVALENT_API_KEY!);

export default client;
