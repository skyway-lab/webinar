import React, { Component } from 'react';
import './App.css';

class App extends Component {
    constructor (props) {
        super(props);
        this.state = {
            mode: undefined,
            localStream: undefined,
            remoteStreams: [],
            waitingPeers: [],
            talkingPeer: undefined,
            talkingStatus: 'none',
            room: undefined,
            myPeerId: undefined
        };
        this.update = this.update.bind(this); // es6対応、ここで実行するわけではない(最後に () がない)
    }
    update (newState) {
        const mode = newState.mode ? newState.mode : this.state.mode;
        const localStream = newState.hasOwnProperty('localStream') ? newState.localStream : this.state.localStream;
        let remoteStreams = this.state.remoteStreams;
        if (newState.remoteStreams && newState.remoteStreams.add) {
            remoteStreams.push(newState.remoteStreams.add);
        }
        if (newState.remoteStreams && newState.remoteStreams.remove) {
            remoteStreams = remoteStreams.filter((stream) => {
                return stream !== newState.remoteStreams.remove;
            });
        }
        let waitingPeers = this.state.waitingPeers;
        if (newState.waitingPeers && newState.waitingPeers.add) {
            waitingPeers.push(newState.waitingPeers.add);
        }
        if (newState.waitingPeers && newState.waitingPeers.remove) {
            waitingPeers = waitingPeers.filter((remotePeerId) => {
                return remotePeerId !== newState.waitingPeers.remove;
            });
        }
        const talkingPeer = newState.hasOwnProperty('talkingPeer') ? newState.talkingPeer : this.state.talkingPeer;
        const talkingStatus = newState.talkingStatus ? newState.talkingStatus : this.state.talkingStatus;
        const room = newState.room ? newState.room : this.state.room;
        const myPeerId = newState.myPeerId ? newState.myPeerId : this.state.myPeerId;
        const settingState = {
            mode: mode,
            localStream: localStream,
            remoteStreams: remoteStreams,
            waitingPeers: waitingPeers,
            talkingPeer: talkingPeer,
            talkingStatus: talkingStatus,
            room: room,
            myPeerId: myPeerId
        };
        console.log('state = ');
        console.log(settingState);
        this.setState(settingState);
    }
    render() {
        return (
            <div className="App">
                <SelectMode update={this.update} mode={this.state.mode} />
                <SpeakerUi
                    roomName="skyway_webinar"
                    update={this.update}
                    mode={this.state.mode}
                    localStream={this.state.localStream}
                    remoteStreams={this.state.remoteStreams}
                    waitingPeers={this.state.waitingPeers}
                    talkingPeer={this.state.talkingPeer}
                    room={this.state.room} />
                <AudienceUi
                    roomName="skyway_webinar"
                    update={this.update}
                    mode={this.state.mode}
                    localStream={this.state.localStream}
                    remoteStreams={this.state.remoteStreams}
                    waitingPeers={this.state.waitingPeers}
                    talkingPeer={this.state.talkingPeer}
                    room={this.state.room}
                    talkingStatus={this.state.talkingStatus}
                    myPeerId={this.state.myPeerId} />
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
                <LocalVideo localStream={this.props.localStream} />
                <h2>聴衆</h2>
                <RemoteVideos remoteStreams={this.props.remoteStreams} mode={this.props.mode} waitingPeers={this.props.waitingPeers} talkingPeer={this.props.talkingPeer} room={this.props.room} update={this.props.update} />
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
                <LocalVideo localStream={this.props.localStream} />
                <h2>講師</h2>
                <RemoteVideos
                    localStream={this.props.localStream}
                    remoteStreams={this.props.remoteStreams}
                    mode={this.props.mode}
                    waitingPeers={this.props.waitingPeers}
                    talkingPeer={this.props.talkingPeer}
                    update={this.props.update}
                    talkingStatus={this.props.talkingStatus}
                    room={this.props.room} />
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
                        <Question
                            localStream={this.props.localStream}
                            update={this.props.update}
                            talkingStatus={this.props.talkingStatus}
                            room={this.props.room} />
                    </div>
                );
            }
            return (
                <div>
                    <video autoPlay src={url} />
                    <Answer
                        remotePeerId={stream.peerId}
                        waitingPeers={this.props.waitingPeers}
                        talkingPeer={this.props.talkingPeer}
                        room={this.props.room}
                        update={this.props.update} />
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

class Question extends Component {
    _onClick (event) {
        const newStatus = event.target.dataset.newStatus;
        this.props.room.send(newStatus);
        this.props.update({talkingStatus: newStatus});
        switch (newStatus) {
            case 'none':
                this.props.localStream.getAudioTracks().forEach((track) => {
                    track.enabled = false;
                });
                this.props.localStream.getVideoTracks().forEach((track) => {
                    track.enabled = false;
                });
                break;
            case 'waiting':
                this.props.localStream.getVideoTracks().forEach((track) => {
                    track.enabled = true;
                });
                break;
            default:
                break;
        }
    }
    render () {
        switch (this.props.talkingStatus) {
            case 'none':
                return (
                    <div>
                        <button onClick={this._onClick.bind(this)} data-new-status="waiting">呼び出し</button>
                    </div>
                );
            case 'waiting':
                return (
                    <div>
                        <button onClick={this._onClick.bind(this)} data-new-status="none">キャンセル</button>
                    </div>
                );
            case 'talking':
                return (
                    <div>
                        <button onClick={this._onClick.bind(this)} data-new-status="none">通話終了</button>
                    </div>
                );
            default:
                return false;
        }
    }
}

class Answer extends Component {
    _onClick (event) {
        const remotePeerId = this.props.remotePeerId;
        const newStatus = event.target.dataset.newStatus;
        this.props.room.send([newStatus, remotePeerId]);
        let talkingPeer = this.props.talkingPeer;
        let waitingPeers = this.props.waitingPeers;
        switch (newStatus) {
            case 'none':
                talkingPeer = undefined;
                waitingPeers = {remove: remotePeerId};
                break;
            case 'talking':
                if (talkingPeer) {
                    this.props.room.send(['none', talkingPeer]);
                    waitingPeers = {remove: talkingPeer};
                }
                talkingPeer = remotePeerId;
                break;
            default:
                break;
        }
        this.props.update({talkingPeer: talkingPeer, waitingPeers: waitingPeers});
    }
    render () {
        const remotePeerId = this.props.remotePeerId;
        const waitingPeers = this.props.waitingPeers;
        const talkingPeer = this.props.talkingPeer;
        if (talkingPeer === remotePeerId) {
            return (
                <div>
                    <button onClick={this._onClick.bind(this)} data-new-status="none">通話終了</button>
                </div>
            );
        } else if (waitingPeers && waitingPeers.includes(remotePeerId)) {
            return (
                <div>
                    <button onClick={this._onClick.bind(this)} data-new-status="talking">許可する</button>
                </div>
            );
        } else {
            return (
                <div>
                    <button disabled>許可する</button>
                </div>
            );
        }
    }
}

function webinar(myPeerId, width, height, isMuted) {
    let peer;
    function connectToSkyWay(_myPeerId, _width, _height, _isMuted) {
        if (_myPeerId) {
            peer = new Peer(_myPeerId, {
                key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837',
                debug: 1
            });
        } else {
            peer = new Peer({
                key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837',
                debug: 1
            });
        }
        peer.on('open', () => {
            showLocalVideo.bind(this)(_width, _height, _isMuted);
            this.props.update({myPeerId: peer.id});
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
            this.props.update({
                remoteStreams: {add: _stream}
            });
        });
        room.on('removeStream', (_stream) => {
            this.props.update({
                remoteStreams: {remove: _stream}
            });
        });
        room.on('close', () => {
            console.warn('room is closed.');
        });
        room.on('peerJoin', () => {
        });
        room.on('data', (msg) => {
            console.log(msg.src + ', ' + msg.data);
            if (this.props.mode === 'speaker') {
                if (msg.data === 'waiting') {
                    this.props.update({waitingPeers: {add: msg.src}});
                } else if (msg.data === 'none') {
                    this.props.update({waitingPeers: {remove: msg.src}});
                    this.props.update({talkingPeer: undefined});
                }
            } else if (this.props.mode === 'audience' && msg.data[1] === this.props.myPeerId) {
                if (msg.data[0] === 'none') {
                    this.props.update({talkingStatus: 'none'});
                    this.props.localStream.getAudioTracks().forEach((track) => {
                        track.enabled = false;
                    });
                    this.props.localStream.getVideoTracks().forEach((track) => {
                        track.enabled = false;
                    });
                } else if (msg.data[0] === 'talking') {
                    this.props.update({talkingStatus: 'talking'});
                    this.props.localStream.getAudioTracks().forEach((track) => {
                        track.enabled = true;
                    });
                }
            }
        });
    }
    connectToSkyWay.bind(this)(myPeerId, width, height, isMuted);
}

export default App;
