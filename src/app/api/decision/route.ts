import { StreamingTextResponse, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createAgent, fromTextStream } from '@statelyai/agent';
console.log(fromTextStream);
import { createMachine, setup } from 'xstate';
import { z } from 'zod';
import { todosMachine } from '@/components/todosMachine';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request, res: Response) {
  const { state, goal }: { state: any; goal: string } = await req.json();

  const agent = createAgent({
    model: openai('gpt-4-turbo'),
    name: 'todo',
    events: {
      'todo.add': z.object({
        todo: z.object({
          title: z.string().describe('The title of the todo'),
          content: z.string().describe('The content of the todo'),
        }),
      }),
    },
  });

  const plan = await agent.decide({
    goal,
    state: todosMachine.resolveState({
      value: {},
      context: {
        todos: [],
        selectedTodo: null,
      },
    }),
    machine: todosMachine,
  });

  console.log(plan);

  return Response.json({ plan });
}
