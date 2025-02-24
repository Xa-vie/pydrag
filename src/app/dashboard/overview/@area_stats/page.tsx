import { delay } from '@/constants/mock-api';
import { FlowGraph } from '@/features/overview/components/flow/flow-graph';

export default async function AreaStats() {
  await await delay(2000);
  return        <>
  <div className='col-span-4'>
  <FlowGraph /> 
</div>
</>;
}
