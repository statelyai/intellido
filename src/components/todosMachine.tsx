import { nanoid } from 'ai';
import { setup, assign, Values, Compute, enqueueActions } from 'xstate';
import { z } from 'zod';

export interface Todo {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

export const events = {
  'todo.add': z.object({
    todo: z
      .object({
        title: z.string().describe('The title of the todo'),
        content: z.string().describe('The content of the todo'),
        completed: z
          .boolean()
          .describe('The completed value of the todo')
          .optional(),
      })
      .describe('Adds a new todo'),
  }),
  'todo.toggle': z.object({
    todoId: z.string().describe('The ID of the todo to toggle'),
    completed: z.boolean().describe('The new completed value').optional(),
  }),
  'todo.update': z.object({
    todo: z.object({
      id: z.string().describe('The ID of the todo to update'),
      title: z.string().describe('The new title of the todo').optional(),
      content: z.string().describe('The new content of the todo').optional(),
      completed: z.boolean().describe('The new completed value').optional(),
    }),
  }),
  'todo.delete': z.object({
    todoId: z.string().describe('The ID of the todo to delete'),
  }),
  'todo.select': z.object({
    todoId: z
      .string()
      .describe('The ID of the todo to select, so the user can edit it'),
  }),
};

export type ZodEvents<T extends Record<string, z.ZodTypeAny>> = Values<{
  [K in keyof T]: Compute<
    {
      type: K;
    } & z.infer<T[K]>
  >;
}>;

export const todosMachine = setup({
  types: {
    context: {} as {
      todos: Todo[];
      selectedTodo: string | null;
    },
    input: {} as {
      todos: Todo[];
    },
    events: {} as ZodEvents<typeof events>,
  },
}).createMachine({
  context: (x) => ({
    todos: x.input.todos,
    selectedTodo: null,
  }),
  on: {
    'todo.add': {
      actions: assign({
        todos: ({ context, event }) => {
          const todo = {
            completed: false,
            ...event.todo,
            id: nanoid(),
          };
          return [...context.todos, todo];
        },
      }),
    },
    'todo.update': {
      actions: assign({
        todos: ({ context, event }) => {
          return context.todos.map((todo) => {
            if (todo.id === event.todo.id) {
              return { ...todo, ...event.todo };
            }
            return todo;
          });
        },
      }),
    },
    'todo.toggle': {
      actions: assign({
        todos: ({ context, event }) => {
          return context.todos.map((todo) => {
            if (todo.id === event.todoId) {
              return {
                ...todo,
                completed: event.completed ?? !todo.completed,
              };
            }
            return todo;
          });
        },
      }),
    },
    'todo.delete': {
      actions: assign({
        todos: ({ context, event }) => {
          return context.todos.filter((todo) => todo.id !== event.todoId);
        },
      }),
    },
    'todo.select': {
      actions: assign({
        selectedTodo: ({ event }) => {
          return event.todoId;
        },
      }),
    },
  },
});
