/**
 * v0 by Vercel.
 * @see https://v0.dev/t/dhuko6AZAe5
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
'use client';

import { SVGProps, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCompletion } from '@ai-sdk/react';
import { useActorRef, useMachine, useSelector } from '@xstate/react';
import { AgentPlan } from '@statelyai/agent';
import { Todo, todosMachine } from './todosMachine';
import { AnyEventObject, AnyMachineSnapshot, createMachine } from 'xstate';
import { Checkbox } from './ui/checkbox';
import clsx from 'clsx';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const magicMachine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        submit: 'submitting',
      },
    },
    submitting: {
      on: {
        submitted: 'idle',
      },
    },
  },
});

export function Magic(props: {
  state: AnyMachineSnapshot;
  onEvent: (event: AnyEventObject) => void;
}) {
  const [state, send] = useMachine(magicMachine);

  return (
    <form
      onSubmit={async (ev) => {
        send({ type: 'submit' });
        ev.preventDefault();
        // get prompt from FormData
        const formData = new FormData(ev.target);
        const prompt = formData.get('prompt');

        const res = await fetch('/api/decision', {
          body: JSON.stringify({
            state: props.state,
            goal: prompt,
          }),
          method: 'post',
        });

        const data = (await res.json()) as { plan: AgentPlan<any> };

        console.log(data);

        props.onEvent(data.plan.nextEvent);
        send({ type: 'submitted' });
      }}
    >
      <Input
        name="prompt"
        disabled={state.matches('submitting')}
        className="text-2xl p-8"
        placeholder="✨ What would you like to do?"
      />
      {/* <Button type="submit" disabled={state.matches('submitting')}>
        {state.matches('submitting') ? 'Submitting...' : 'Submit'}
      </Button> */}
    </form>
  );
}

export function Todos() {
  const todosActor = useActorRef(todosMachine, {
    input: {
      todos: [
        {
          id: 'todo-1',
          title: 'Finish React Summit talk',
          content: 'Need to record my demos in case they fail',
          completed: false,
        },
      ],
    },
  });
  const todos = useSelector(todosActor, (state) => state.context.todos);
  const selectedTodo = useSelector(todosActor, (state) =>
    state.context.todos.find((todo) => todo.id === state.context.selectedTodo)
  );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-4xl space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <Magic
          state={todosActor.getSnapshot()}
          onEvent={(ev) => todosActor.send(ev as any)}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-bold">Todos</h2>
            <div
              className="space-y-4"
              style={{
                maxHeight: '50vh',
                overflowY: 'auto',
              }}
            >
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={clsx(
                    'rounded-lg bg-gray-50 p-4 shadow-sm transition-all hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 flex flex-row gap-2 border-2 items-baseline',
                    {
                      'line-through': todo.completed,
                      'opacity-50': todo.completed,
                      'border-blue-500': selectedTodo?.id === todo.id,
                      'border-transparent': selectedTodo?.id !== todo.id,
                    }
                  )}
                  onClick={() =>
                    todosActor.send({
                      type: 'todo.select',
                      todoId: todo.id,
                    })
                  }
                >
                  {' '}
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={(x) => {
                      todosActor.send({
                        type: 'todo.toggle',
                        todoId: todo.id,
                      });
                    }}
                  />
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">
                      <span>{todo.title}</span>
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400">
                      {todo.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {selectedTodo && (
              <EditTodo
                todo={selectedTodo}
                onUpdateTodo={(updatedTodo) => {
                  todosActor.send({
                    type: 'todo.update',
                    todo: updatedTodo,
                  });
                }}
                onDeleteTodo={() => {
                  todosActor.send({
                    type: 'todo.delete',
                    todoId: selectedTodo.id,
                  });
                }}
                key={selectedTodo.id}
              />
            )}
          </div>
        </div>
        <Button
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
        </Button>
      </div>
    </div>
  );
}

function EditTodo(props: {
  todo: Todo;
  onUpdateTodo: (todo: Todo) => void;
  onDeleteTodo: () => void;
}) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Edit Todo</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            defaultValue={props.todo.title}
            onBlur={(ev) => {
              props.onUpdateTodo({
                ...props.todo,
                title: ev.target.value,
              });
            }}
          />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <TodoContent
            todo={props.todo}
            onUpdateContent={(content) => {
              props.onUpdateTodo({
                ...props.todo,
                content,
              });
            }}
          />
        </div>
        <Button variant="destructive" size="sm" onClick={props.onDeleteTodo}>
          Delete todo item
        </Button>
      </div>
    </div>
  );
}

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

function TodoContent(props: {
  todo: Todo;
  onUpdateContent: (content: string) => void;
}) {
  const {
    completion,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useCompletion({
    api: '/api/completion',
    onFinish: (_, completion) => {
      props.onUpdateContent(completion);
    },
  });
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInput(
      'Add very brief, short content for this todo item: ' + props.todo.title
    );
  }, [props.todo.title]);

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        id="content"
        defaultValue={props.todo.content}
        value={completion}
        rows={4}
        ref={ref}
      />
      <Button
        type="submit"
        className="p-2 transition-opacity"
        variant="ghost"
        disabled={isLoading}
      >
        {isLoading ? '✨ Generating...' : '✨ Generate'}
      </Button>
    </form>
  );
}
