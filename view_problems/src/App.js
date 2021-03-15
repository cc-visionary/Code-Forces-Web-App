import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.css';

import Home from './pages/Home/Home';
import Statistics from './pages/Statistics/Statistics';
import RandomResults from './pages/RandomResults/RandomResults';
import Calendar from './pages/Calendar/Calendar'
import NoMatchPage from './pages/NoMatchPage/NoMatchPage'


export default class App extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      data: []
    };
  };

  fetchUpdateAll = () => {
    /**
     * Fetches the data from api/problems which contains all the problems
     * then load it to this.state.data
     */
    fetch('/api/problems/')
      .then(res => res.json())
      .then(json => {
        this.setState({data: json})
      })
  }

  componentDidMount = () => {
    this.fetchUpdateAll()
  }

  render() {
    return (
      <Router className="App">
        <Switch>
          <Route exact path="/random_results" component={RandomResults} />
          <Route exact path="/calendar" component={() => <Calendar  data={this.state.data} />} />
          <Route exact path="/statistics" component={() => <Statistics data={this.state.data} />} />
          <Route exact path="/" component={() => <Home data={this.state.data} />} />
          <Route component={NoMatchPage} />
        </Switch>
    </Router>
    )
  };
}