import React, { Component } from 'react';
import './App.css';

import Home from './pages/Home/Home';

export default class App extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
       data: [],
       columns: [],
    };
  };


  componentDidMount = () => {
  };

  render() {
    console.log(this.state.columns)
    return (
      <div className="App">
        <Home data={this.state.data} columns={this.state.columns} />
      </div>
    );
  }
}
