/**
 * v0 by Vercel.
 * @see https://v0.dev/t/dhuko6AZAe5
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
'use client';

import { SVGProps, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCompletion } from '@ai-sdk/react';
import { useActorRef, useSelector } from '@xstate/react';
import { AgentPlan, createAgent } from '@statelyai/agent';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { Todo, todosMachine } from './todosMachine';

export function Todos() {
  const todosActor = useActorRef(todosMachine);
  const todos = useSelector(todosActor, (state) => state.context.todos);
  const selectedTodo = useSelector(todosActor, (state) =>
    state.context.todos.find((todo) => todo.id === state.context.selectedTodo)
  );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-4xl space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <button
          onClick={async () => {
            const res = await fetch('/api/decision', {
              body: JSON.stringify({
                state: {},
                goal: 'I need to eat a stroopwafel',
              }),
              method: 'post',
            });

            const data = (await res.json()) as { plan: AgentPlan<any> };

            console.log(data);

            todosActor.send(data.plan.nextEvent);
          }}
        >
          asdf
        </button>
        <div>
          <h1 className="text-3xl font-bold">Todo App</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your tasks with ease.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-bold">Todos</h2>
            <div className="space-y-4">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="rounded-lg bg-gray-50 p-4 shadow-sm transition-all hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{todo.title}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        todosActor.send({
                          type: 'todo.select',
                          todoId: todo.id,
                        })
                      }
                    >
                      <FilePenIcon className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {todo.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>{selectedTodo && <TodoDescription />}</div>
        </div>
        <button
          onClick={() => {
            todosActor.send({
              type: 'todo.add',
              todo: {
                title: 'New todo',
                content: 'New todo content',
              },
            });
          }}
        >
          Add todo
        </button>
        <div className="flex justify-end">
          {/* <Button onClick={handleGenerateRandomTodo}>
            Generate Random Todo
          </Button> */}
        </div>
      </div>
    </div>
  );
}

export function Todos2() {
  const [todos, setTodos] = useState([
    {
      id: 1,
      title: 'Finish project proposal',
      content: 'Write up the details for the new product launch',
    },
    {
      id: 2,
      title: 'Schedule team meeting',
      content: 'Discuss progress and next steps',
    },
    {
      id: 3,
      title: 'Research new design trends',
      content: 'Look into the latest UI/UX best practices',
    },
  ]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setNewTitle(todo.title);
    setNewContent(todo.content);
  };
  const handleUpdateTodo = () => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === selectedTodo?.id) {
        return { ...todo, title: newTitle, content: newContent };
      }
      return todo;
    });
    setTodos(updatedTodos);
    setSelectedTodo(null);
    setNewTitle('');
    setNewContent('');
  };
  const handleGenerateRandomTodo = () => {
    const randomTitle = `Todo ${todos.length + 1}`;
    const randomContent = `This is a randomly generated todo with some sample content.`;
    const newTodo = {
      id: todos.length + 1,
      title: randomTitle,
      content: randomContent,
    };
    setTodos([...todos, newTodo]);
  };
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-950">
      <button
        onClick={() => {
          fetch('/api/decision', {
            body: JSON.stringify({
              state: {},
            }),
            method: 'post',
          })
            .then((res) => res.json())
            .then(console.log);
        }}
      >
        asdf
      </button>
      <div className="w-full max-w-4xl space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div>
          <h1 className="text-3xl font-bold">Todo App</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your tasks with ease.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-bold">Todos</h2>
            <div className="space-y-4">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="rounded-lg bg-gray-50 p-4 shadow-sm transition-all hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{todo.title}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTodo(todo)}
                    >
                      <FilePenIcon className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {todo.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>{selectedTodo && <TodoDescription />}</div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleGenerateRandomTodo}>
            Generate Random Todo
          </Button>
        </div>
      </div>
    </div>
  );
}

// function EditTodo() {
//   const { completion, input, handleInputChange, handleSubmit } = useCompletion({
//     api: '/api/completion',
//   });
//   const [content, setContent] = useState('');

//   return (
//     <div>
//       <h2 className="mb-4 text-xl font-bold">Edit Todo</h2>
//       <div className="space-y-4">
//         <div>
//           <Label htmlFor="title">Title</Label>
//           <Input
//             id="title"
//             value={newTitle}
//             onChange={(e) => setNewTitle(e.target.value)}
//           />
//         </div>
//         <div>
//           <Label htmlFor="content">Content</Label>
//           <Textarea
//             id="content"
//             value={completion}
//             // onChange={(e) => setNewContent(e.target.value)}
//             rows={4}
//           />
//           <Button onClick={handleInputChange}>asdf</Button>
//         </div>
//         <div className="flex justify-end">
//           <Button onClick={handleUpdateTodo}>Update</Button>
//         </div>
//       </div>
//     </div>
//   );
// }

function FilePenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  );
}

function TodoDescription() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: '/api/completion',
  });

  return (
    <form onSubmit={handleSubmit} className="text-black">
      <input
        name="prompt"
        value={input}
        onChange={handleInputChange}
        id="input"
      />
      <button type="submit">Submit</button>
      <textarea value={completion} />
    </form>
  );
}
