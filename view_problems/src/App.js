import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

import Home from './pages/Home/Home';

export default class App extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
       
    };
  };

  componentDidMount = () => {
    
  };

  render() {
    return (
      <div className="App">
        <Home data={{}} />
      </div>
    );
  }
}

export default App;
