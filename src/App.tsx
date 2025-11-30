import React, { Suspense } from 'react';
import Header from './components/Header';
import InputColumn from './components/InputColumn';
const OutputColumn = React.lazy(() => import('./components/OutputColumn'));

function App() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/2 p-4 border-r overflow-y-auto">
          <InputColumn />
        </div>
        <div className="w-1/2 p-4 overflow-y-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <OutputColumn />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;