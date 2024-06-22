import { openai } from '@ai-sdk/openai';
import { createAgent } from '@statelyai/agent';
import { events, todosMachine } from '@/components/todosMachine';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request, res: Response) {
  const { state, goal }: { state: any; goal: string } = await req.json();

  const agent = createAgent({
    model: openai('gpt-4-turbo'),
    name: 'todo',
    events,
  });

  const plan = await agent.decide({
    goal,
    state: todosMachine.resolveState(state),
    machine: todosMachine,
  });

  console.log(plan);

  return Response.json({ plan });
}
