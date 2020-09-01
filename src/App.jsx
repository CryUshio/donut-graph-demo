import React from 'react';
import Donut from './components/Donut';

import './App.css';

const donutData = [{
  per: 0.45,
  text: '学习课'
}, {
  per: 0.25,
  text: '复习课'
}, {
  per: 0.3,
  text: '拓展课'
}];

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Donut Graph</p>
        <Donut title="已学课程类型" source={donutData} width={400} height={240}></Donut>
      </header>
    </div>
  );
}

export default App;
