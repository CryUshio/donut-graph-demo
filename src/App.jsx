import React from 'react';
import Donut from './components/Donut';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Donut Graph</p>
        <Donut width={400} height={200}></Donut>
      </header>
    </div>
  );
}

export default App;
