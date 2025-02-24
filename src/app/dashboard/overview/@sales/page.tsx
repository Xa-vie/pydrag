import { delay } from '@/constants/mock-api';

export default async function Sales() {
  await delay(3000);
  return <>Sales Graph</>;
}
