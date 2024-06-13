'use client';

import { Todos } from '@/components/todos';
import { useCompletion } from '@ai-sdk/react';

export default function Home() {
  // return (
  //   <form onSubmit={handleSubmit} className="text-white">
  //     <input
  //       name="prompt"
  //       value={input}
  //       onChange={handleInputChange}
  //       id="input"
  //     />
  //     <button type="submit">Submit</button>
  //     <div>{completion}</div>
  //   </form>
  // );
  return (
    <>
      <Todos />
    </>
  );
}
