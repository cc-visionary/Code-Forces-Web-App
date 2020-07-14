import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.css';

import Home from './pages/Home/Home';
import Statistics from './pages/Statistics/Statistics';
import RandomResults from './pages/RandomResults/RandomResults';


export default function App() {
  return (
    <Router className="App">
      <Switch>
        <Route path="/random_results" component={RandomResults} />
        <Route path="/statistics" component={Statistics} />
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
}