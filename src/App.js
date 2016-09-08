import React, { Component } from 'react';
import './App.css';

class App extends Component {
    constructor (props) {
        super(props);
        this.state = {
            localStream: undefined,
            remoteStreams: []
        };
        this.update = this.update.bind(this); // es6対応
    }
    update (newState) {
        const localStream = newState.hasOwnProperty('localStream') ? newState.localStream : this.state.localStream;
        this.setState({
            localStream: localStream,
            remoteStreams: []
        });
    }
    render() {
        return (
            <div className="App">
                <SpeakerUi roomName="skyway-webinar" update={this.update} localStream={this.state.localStream} remoteStreams={this.state.remoteStreams} ></SpeakerUi>
            </div>
        );
    }
}

class SpeakerUi extends Component {
    constructor (props) {
        super(props);
        this.peer = new Peer({
            key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837',
            debug: 3
        });
        this.peer.on('open', () => {
            console.log('peer.id is ' + this.peer.id);
        });
        this.peer.on('error', (err) => {
            console.error(err.message);
        });
    }
    _onClick () {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        const videoConstraints
            = navigator.webkitGetUserMedia
            ? // for chrome
                {
                    "mandatory": {
                        "maxWidth": "320",
                        "maxHeight": "180",
                        "maxFrameRate": "5"
                    },
                    "optional": []
                }
            : // for firefox
                {
                    "width": { max: 320 },
                    "height": { max: 180 },
                    "facingMode": "user"
                };
        const roomName = this.props.roomName;
        navigator.getUserMedia({audio: true, video: videoConstraints}, (stream) => {
            this.room = this.peer.joinRoom(roomName, {mode: 'sfu', stream: stream});
            this.props.update({
                localStream: stream
            });
        }, (err) => {
            console.error(err);
        });
    }
    render () {
        return (
            <div>
                <h1>講師</h1>
                <button onClick={this._onClick.bind(this)} >Call</button>
                <LocalVideo localStream={this.props.localStream} />
                <RemoteVideos remoteStreams={this.props.remoteStreams} />
            </div>
        );
    }
}

class LocalVideo extends Component {
    render () {
        let localVideoNode;
        if (this.props.localStream) {
            const url = URL.createObjectURL(this.props.localStream)
            localVideoNode = (() => {return (
                <video autoPlay src={url} />
            )})();  // 即時実行
        }
        return (
            <div>
                <h2>ローカルビデオ</h2>
                {localVideoNode}
            </div>
        )
    }
}

class RemoteVideos extends Component {
    render () {
        const remoteStreamNodes = this.props.remoteStreams.map((stream) => {
            return (
                <video></video>
            )
        })
        return (
            <div>
                <h2>リモートビデオ</h2>
                {remoteStreamNodes}
            </div>
        )
    }
}

export default App;
