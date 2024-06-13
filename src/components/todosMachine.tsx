import { nanoid } from 'ai';
import { setup, assign } from 'xstate';

export interface Todo {
  id: string;
  title: string;
  content: string;
}

export const todosMachine = setup({
  types: {
    context: {} as {
      todos: Todo[];
      selectedTodo: string | null;
    },
  },
}).createMachine({
  context: {
    todos: [
      {
        id: 'todo-1',
        title: 'Finish project proposal',
        content: 'Write up the details for the new product launch',
      },
      {
        id: 'todo-2',
        title: 'Schedule team meeting',
        content: 'Discuss progress and next steps',
      },
      {
        id: 'todo-3',
        title: 'Research new design trends',
        content: 'Look into the latest UI/UX best practices',
      },
    ],
    selectedTodo: null,
  },
  on: {
    'todo.add': {
      actions: assign({
        todos: ({ context, event }) => {
          const todo = {
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
              return event.todo;
            }
            return todo;
          });
        },
      }),
    },
    'todo.delete': {
      actions: assign({
        todos: ({ context, event }) => {
          return context.todos.filter((todo) => todo.id !== event.todo.id);
        },
      }),
    },
    'todo.select': {
      actions: assign({
        selectedTodo: ({ context, event }) => {
          return event.todoId;
        },
      }),
    },
  },
});
