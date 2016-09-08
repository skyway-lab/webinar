import React, { Component } from 'react';
import './App.css';

class App extends Component {
    render() {
        return (
            <div className="App">
                <SpeakerUi></SpeakerUi>
                <ListenerUi></ListenerUi>
            </div>
        );
    }
}

class SpeakerUi extends Component {
    render () {
        return (
            <div>
                <h1>講師</h1>
            </div>
        );
    }
}

class ListenerUi extends Component {
    render () {
        return (
            <div>
                <h1>視聴者</h1>
            </div>
        );
    }
}

export default App;
