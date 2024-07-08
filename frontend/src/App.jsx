import React, { useState } from 'react';
import Canvas from './components/Canvas';
import LiveCode from './components/LiveCode';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [elements, setElements] = useState([]);

  return (
    <div className="App flex flex-col h-screen bg-[#1E1E1E]">
      <header className="App-header p-4 bg-[#2C2C2C] shadow-2xl">
        <h1 className="text-3xl text-[#b1adad]">Dezlopers</h1>
      </header>
      <div className="flex h-screen overflow-hidden w-full">
          <LiveCode elements={elements} />
        <ErrorBoundary>
          <Canvas elements={elements} setElements={setElements} />
          </ErrorBoundary>
        </div>
    </div>
  );
}

export default App;

