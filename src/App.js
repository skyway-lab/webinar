import React, { Component } from 'react';
import './App.css';

class App extends Component {
    constructor (props) {
        super(props);
        this.state = {
            mode: undefined,
            localStream: undefined,
            remoteStreams: [],
            answerStatus: [],
            questionStatus: 'none',
            room: undefined
        };
        this.update = this.update.bind(this); // es6対応、ここで実行するわけではない(最後に () がない)
    }
    update (newState) {
        const mode = newState.mode ? newState.mode : this.state.mode;
        const localStream = newState.hasOwnProperty('localStream') ? newState.localStream : this.state.localStream;
        let remoteStreams = this.state.remoteStreams;
        if (newState.remoteStream && newState.remoteStream.add) {
            remoteStreams.push(newState.remoteStream.add);
        }
        if (newState.remoteStream && newState.remoteStream.remove) {
            remoteStreams = remoteStreams.filter((stream) => {
                return stream !== newState.remoteStream.remove;
            });
        }
        let answerStatus = this.state.answerStatus;
        if (newState.answerStatus && newState.answerStatus.add) {
            answerStatus.push(newState.answerStatus.add);
        }
        if (newState.answerStatus && newState.answerStatus.remove) {
            answerStatus = answerStatus.filter((status) => {
                return true;    //ここから再開
            });
        }
        if (newState.answerStatus && newState.answerStatus.remove) {
        }
        const questionStatus = newState.questionStatus ? newState.questionStatus : this.state.questionStatus;
        const room = newState.room ? newState.room : this.state.room;
        this.setState({
            mode: mode,
            localStream: localStream,
            remoteStreams: remoteStreams,
            answerStatus: [],
            questionStatus: questionStatus,
            room: room
        });
    }
    render() {
        return (
            <div className="App">
                <SelectMode update={this.update} mode={this.state.mode} />
                <SpeakerUi roomName="skyway_webinar" update={this.update} mode={this.state.mode} localStream={this.state.localStream} remoteStreams={this.state.remoteStreams} />
                <AudienceUi roomName="skyway_webinar" update={this.update} mode={this.state.mode} localStream={this.state.localStream} remoteStreams={this.state.remoteStreams} questionStatus={this.state.questionStatus} room={this.state.room} />
            </div>
        );
    }
}

class SelectMode extends Component {
    _onClick (event) {
        this.props.update({
            mode: event.target.dataset.mode
        });
    }
    render () {
        if (!this.props.mode) {
            return (
                <div>
                    <h1>モード選択</h1>
                    <button data-mode="speaker" onClick={this._onClick.bind(this)}>Speaker</button>
                    <button data-mode="audience" onClick={this._onClick.bind(this)}>Audience</button>
                </div>
            );
        } else {
            return false;
        }
    }
}

class SpeakerUi extends Component {
    constructor (props) {
        super(props);
        this.isWebinarStarted = false;
    }
    render () {
        if (this.props.mode !== 'speaker') {
            return false;
        }
        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            webinar.bind(this)('speaker', 640, 360, false);
        }
        return (
            <div>
                <h1>講師</h1>
                <h2>自分</h2>
                <LocalVideo localStream={this.props.localStream} peerId={this.props.peerId} />
                <h2>聴衆</h2>
                <RemoteVideos remoteStreams={this.props.remoteStreams} mode={this.props.mode} />
            </div>
        );
    }
}

class AudienceUi extends Component {
    constructor (props) {
        super(props);
        this.isWebinarStarted = false;
    }
    render () {
        if (this.props.mode !== 'audience') {
            return false;
        }
        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            webinar.bind(this)(undefined, 160, 90, true);
        }
        return (
            <div>
                <h1>視聴者</h1>
                <h2>自分</h2>
                <LocalVideo localStream={this.props.localStream} mode={this.props.mode} />
                <Question update={this.props.update} peerId={this.props.peerId} questionStatus={this.props.questionStatus} room={this.props.room} />
                <h2>講師</h2>
                <RemoteVideos remoteStreams={this.props.remoteStreams} mode={this.props.mode} />
            </div>
        );
    }
}

class LocalVideo extends Component {
    render () {
        if (!this.props.localStream) {
            return false;
        }
        const url = URL.createObjectURL(this.props.localStream);
        return (
            <div>
                <video autoPlay src={url} />
            </div>
        );
    }
}

class Question extends Component {
    _onClick (event) {
        const msg = event.target.dataset.msg;
        const newStatus = event.target.dataset.newStatus;
        this.props.room.send(msg);
        this.props.update({questionStatus: newStatus});
    }
    render () {
        switch (this.props.questionStatus) {
            case 'none':
                return (
                    <div>
                        <button onClick={this._onClick.bind(this)} data-msg="question" data-new-status="waiting">質問する</button>
                    </div>
                );
            case 'waiting':
                return (
                    <div>
                        <button disabled>質問待ち</button>
                        <button onClick={this._onClick.bind(this)} data-msg="cancel" data-new-status="none">終了</button>
                    </div>
                );
            case 'doing':
                return (
                    <div>
                        <button disabled>質問中</button>
                        <button onClick={this._onClick.bind(this)} data-msg="cancel" data-new-status="none">終了</button>
                    </div>
                );
            default:
                return false;
        }
    }
}

class RemoteVideos extends Component {
    render () {
        const mode = this.props.mode;
        const remoteStreamNodes = this.props.remoteStreams.map((stream) => {
            const url = URL.createObjectURL(stream);
            if (mode === 'audience') {
                if (stream.peerId !== 'speaker') {
                    return false;
                }
                return (
                    <div>
                        <video autoPlay src={url} />
                    </div>
                );
            }
            return (
                <div>
                    <video autoPlay src={url} />
                    <Answer peerId={stream.peerId} />
                </div>
            );
        });
        return (
            <div>
                {remoteStreamNodes}
            </div>
        );
    }
}

class Answer extends Component {
    render () {
        return (
            <div>
                <button disabled>許可する</button>
                <button>許可する</button>
                <button>終了</button>
            </div>
        );
    }
}

function webinar(peerId, width, height, isMuted) {
    let peer;
    function connectToSkyWay(_peerId, _width, _height, _isMuted) {
        if (_peerId) {
            peer = new Peer(_peerId, {
                key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837',
                debug: 3
            });
        } else {
            peer = new Peer({
                key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837',
                debug: 3
            });
        }
        peer.on('open', () => {
            showLocalVideo.bind(this)(_width, _height, _isMuted);
        });
        peer.on('error', (err) => {
            console.error(err.message);
        });
    }
    function showLocalVideo(__width, __height, __isMuted) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        const videoConstraints
            = navigator.webkitGetUserMedia
            ? // for chrome
        {
            mandatory: {
                maxWidth: __width,
                maxHeight: __height,
                maxFrameRate: 5
            }
        }
            : // for firefox
        {
            width: __width,
            height: __height,
            facingMode: 'user'
        };
        navigator.getUserMedia({audio: true, video: videoConstraints}, (stream) => {
            if (isMuted) {
                stream.getAudioTracks().forEach((track) => {
                    track.enabled = false;
                });
                stream.getVideoTracks().forEach((track) => {
                    track.enabled = false;
                });
            }
            this.props.update({
                localStream: stream
            });
            showRemoteVideo.bind(this)(stream);
        }, (err) => {
            console.error(err);
        });
    }
    function showRemoteVideo(_stream) {
        const roomName = this.props.roomName;
        const room = peer.joinRoom(roomName, {mode: 'sfu', stream: _stream});
        this.props.update({
            room: room
        });
        room.on('stream', (_stream) => {
            const answerStatus = {};
            answerStatus[_stream.peerId] = 'none';
            this.props.update({
                remoteStream: {add: _stream},
                answerStatus: {add: answerStatus}
            });
        });
        room.on('removeStream', (_stream) => {
            this.props.update({
                remoteStream: {remove: _stream}
            });
        });
        room.on('close', () => {
            console.warn('room is closed.');
        });
        room.on('peerJoin', () => {
            console.log('peerJoin');
        });
        room.on('data', (msg) => {
            console.log(msg.src + ', ' + msg.data);
        });
    }
    connectToSkyWay.bind(this)(peerId, width, height, isMuted);
}

export default App;
