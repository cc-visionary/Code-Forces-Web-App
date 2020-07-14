import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './Statistics.css'

export default class componentName extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }
    
    render() {
        return (
            <div>
                <Link to='/'>Go back</Link>
                <div> Statistics </div>
            </div>
        );
    }
}
