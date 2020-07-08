import React from 'react';
import './App.css';

import Home from './pages/Home/Home';

import data from './data/codeforces_problems.json'

function App() {
  return (
    <div className="App">
      <Home data={data} />
    </div>
  );
}

export default App;
