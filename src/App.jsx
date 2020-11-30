import React from 'react';
import Donut from './components/Donut';

import './App.css';

const donutData = [{
  per: 0.2,
  text: '学习课'
}, {
  per: 0.2,
  text: '复习课'
}, {
  per: 0.2,
  text: '拓展课'
}, {
  per: 0.2,
  text: '练习课'
}, {
  per: 0.2,
  text: '综合课'
}];

function App() {
  return (
    <div className="App">
      <section className="App-section">
        <p>Donut Graph</p>
        <Donut title="已学课程类型" source={donutData} width={400} height={240} showLegend></Donut>
      </section>
    </div>
  );
}

export default App;
