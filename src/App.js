import React, {Component} from 'react';
import './App.css';
import Routes from "./Routes";

export default class App extends Component {
    render() {
        // console.log('PROPS', this.props);
        return (
            <div className="App container py-3">
                <Routes/>
            </div>
        );
    }
}

