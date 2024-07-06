import React, { useState } from 'react';
import Canvas from './components/Canvas';
import LiveCode from './components/LiveCode';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [elements, setElements] = useState([]);

  return (
    <div className="App flex flex-col h-screen bg-[#1E1E1E]">
      <header className="App-header p-4 bg-gray-200">
        <h1 className="text-3xl">Dezlopers :- <span className='text-base font-bold'>Designers who are also Devlopers</span></h1>
      </header>
      <div className="flex flex-1 w-full">
        <ErrorBoundary>
          <Canvas elements={elements} setElements={setElements} />
          </ErrorBoundary>
          <LiveCode elements={elements} />
        </div>
    </div>
  );
}

export default App;

