import React, { Component } from 'react';
import './App.css';

class App extends Component {
    constructor (props) {
        super(props);
        this.state = {
            mode: null,
            localStream: null,
            remoteStreams: [],
            waitingPeers: [],
            talkingPeer: null,
            talkingStatus: 'none',
            room: null,
            myPeerId: null
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
        const state = {
            mode: mode,
            localStream: localStream,
            remoteStreams: remoteStreams,
            waitingPeers: waitingPeers,
            talkingPeer: talkingPeer,
            talkingStatus: talkingStatus,
            room: room,
            myPeerId: myPeerId
        };
        this.setState(state);
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
                <div id="SelectMode">
                    <h1>SkyWay Webinar</h1>
                    <div className="button-container">
                        <button data-mode="speaker" onClick={this._onClick.bind(this)}>Speaker</button>
                        <button data-mode="audience" onClick={this._onClick.bind(this)}>Audience</button>
                    </div>
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
            webinar.bind(this)('speaker', 1280, 720, 5, false);
        }
        return (
            <div id="SpeakerUi">
                <h1 className="none">講師</h1>
                <h2 className="none">自分</h2>
                <LocalVideo localStream={this.props.localStream} />
                <Config update={this.props.update} />
                <h2 className="none">聴衆</h2>
                <RemoteVideos
                    remoteStreams={this.props.remoteStreams}
                    target="audience"
                    waitingPeers={this.props.waitingPeers}
                    talkingPeer={this.props.talkingPeer}
                    room={this.props.room}
                    update={this.props.update} />
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
            webinar.bind(this)(null, 160, 90, 1, true);
        }
        return (
            <div id="AudienceUi">
                <h1 className="none">視聴者</h1>
                <h2 className="none">講師</h2>
                <RemoteVideos
                    localStream={this.props.localStream}
                    remoteStreams={this.props.remoteStreams}
                    target="speaker"
                    waitingPeers={this.props.waitingPeers}
                    talkingPeer={this.props.talkingPeer}
                    update={this.props.update}
                    talkingStatus={this.props.talkingStatus}
                    room={this.props.room} />
                <h2 className="none">自分</h2>
                <LocalVideo localStream={this.props.localStream} />
                <h2 className="none">質問者</h2>
                <RemoteVideos
                    remoteStreams={this.props.remoteStreams}
                    talkingPeer={this.props.talkingPeer}
                    target="questioner" />
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
            <div id="LocalVideo">
                <video autoPlay muted src={url} />
            </div>
        );
    }
}

class RemoteVideos extends Component {
    render () {
        const target = this.props.target;
        const remoteStreamNodes = this.props.remoteStreams.map((stream) => {
            const url = URL.createObjectURL(stream);
            switch (target) {
                case 'speaker':
                    if (stream.peerId !== 'speaker') {
                        return false;
                    }
                    return (
                        <div className="remote-video-wrapper">
                            <video autoPlay src={url} />
                            <Question
                                localStream={this.props.localStream}
                                update={this.props.update}
                                talkingStatus={this.props.talkingStatus}
                                room={this.props.room} />
                        </div>
                    );
                case 'audience':
                    return (
                        <div className="remote-video-wrapper">
                            <video autoPlay src={url} />
                            <Answer
                                remotePeerId={stream.peerId}
                                waitingPeers={this.props.waitingPeers}
                                talkingPeer={this.props.talkingPeer}
                                room={this.props.room}
                                update={this.props.update} />
                        </div>
                    );
                case 'questioner':
                    if (stream.peerId !== this.props.talkingPeer) {
                        return false;
                    }
                    return (
                        <div className="remote-video-wrapper">
                            <video autoPlay src={url} />
                        </div>
                    );
                default:
                    return false;
            }
        });
        return (
            <div className={"remote-videos remote-videos-" + target}>
                {remoteStreamNodes}
            </div>
        );
    }
}

class Question extends Component {
    _onClick (event) {
        const newStatus = event.target.dataset.newStatus;
        let state = {};
        switch (newStatus) {
            case 'none':
                state.talkingStatus = 'none';
                state.talkingPeer = null;
                this.props.room.send('none');
                this.props.localStream.getAudioTracks().forEach((track) => {
                    track.enabled = false;
                });
                this.props.localStream.getVideoTracks().forEach((track) => {
                    track.enabled = false;
                });
                break;
            case 'waiting':
                state.talkingStatus = 'waiting';
                this.props.room.send('waiting');
                this.props.localStream.getVideoTracks().forEach((track) => {
                    track.enabled = true;
                });
                break;
            default:
                break;
        }
        if (Object.keys(state).length > 0) {
            this.props.update(state);
        }
    }
    render () {
        switch (this.props.talkingStatus) {
            case 'none':
                return (
                    <div className="button-wrapper button-wrapper-call">
                        <button onClick={this._onClick.bind(this)} data-new-status="waiting">Call</button>
                    </div>
                );
            case 'waiting':
                return (
                    <div className="button-wrapper button-wrapper-cancel">
                        <button onClick={this._onClick.bind(this)} data-new-status="none">Cancel</button>
                    </div>
                );
            case 'talking':
                return (
                    <div className="button-wrapper button-wrapper-disconnect">
                        <button onClick={this._onClick.bind(this)} data-new-status="none">Disconnect</button>
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
        let talkingPeer = this.props.talkingPeer;
        let waitingPeers = this.props.waitingPeers;
        switch (newStatus) {
            case 'none':
                talkingPeer = null;
                waitingPeers = {remove: remotePeerId};
                break;
            case 'talking':
                if (talkingPeer) {
                    waitingPeers = {remove: talkingPeer};
                }
                talkingPeer = remotePeerId;
                break;
            default:
                break;
        }
        this.props.room.send(talkingPeer);
        this.props.update({talkingPeer: talkingPeer, waitingPeers: waitingPeers});
    }
    render () {
        const remotePeerId = this.props.remotePeerId;
        const waitingPeers = this.props.waitingPeers;
        const talkingPeer = this.props.talkingPeer;
        if (talkingPeer === remotePeerId) {
            return (
                <div className="button-wrapper button-wrapper-disconnect">
                    <button onClick={this._onClick.bind(this)} data-new-status="none">Disconnect</button>
                </div>
            );
        } else if (waitingPeers && waitingPeers.includes(remotePeerId)) {
            return (
                <div className="button-wrapper button-wrapper-accept">
                    <button onClick={this._onClick.bind(this)} data-new-status="talking">Accept</button>
                </div>
            );
        } else {
            return (
                <div className="button-wrapper button-wrapper-videooff">
                    Video Off
                </div>
            );
        }
    }
}

class Config extends Component {
    _onChange (event) {
        console.log(event.target);
        const screenshare = new SkyWay.ScreenShare({debug: true});

        if (screenshare.isEnabledExtension()) {
            startScreenShare.bind(this)();
        } else {
            installExtension();
        }

        function startScreenShare() {
            screenshare.startScreenShare({
                Width: 1920,
                Height: 1080,
                FrameRate: 5
            }, (stream) => {
                console.log('successed screenshare');
                this.props.update({localStream: stream});
            }, function(err) {
                // onError
                console.error('[error in starting screen share]', err);
            }, function() {
                // onStopscreenshare
                console.log('stop screen share');
            });
        }

        function installExtension() {
            chrome.webstore.install('', () => {
                console.log('succeeded to install extension');
            }, (ev) => {
                console.error('[error in installing extension]', ev);
            });

            window.addEventListener('message', function(ev) {
                if(ev.data.type === "ScreenShareInjected") {
                    console.log('screen share extension is injected, get ready to use');
                    startScreenShare();
                }
            }, false);
        }
    }
    render () {
        return (
            <div id="Config">
                <h2>Video Source</h2>
                <label>
                    <input type="radio" name="videoSource" id="camera" onChange={this._onChange.bind(this)} defaultChecked />
                    Camera
                </label>
                <label>
                    <input type="radio" name="videoSource" id="screen" onChange={this._onChange.bind(this)} />
                    Screen
                </label>
            </div>
        );
    }
}

function webinar(myPeerId, width, height, framerate, isMuted) {
    let peer;
    function connectToSkyWay(_myPeerId, _width, _height, _framerate, _isMuted) {
        if (_myPeerId) {
            peer = new Peer(_myPeerId, {
                key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837'
            });
        } else {
            peer = new Peer({
                key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837'
            });
        }
        peer.on('open', () => {
            showLocalVideo.bind(this)(_width, _height, _framerate, _isMuted);
            this.props.update({myPeerId: peer.id});
        });
        peer.on('error', (err) => {
            console.error(err.message);
        });
    }
    function showLocalVideo(__width, __height, __framerate, __isMuted) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        const videoConstraints
            = navigator.webkitGetUserMedia
            ? // for chrome
        {
            mandatory: {
                maxWidth: __width,
                maxHeight: __height,
                maxFrameRate: __framerate
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
            console.log('room.on(\'stream\')');
            this.props.update({
                remoteStreams: {add: _stream}
            });
        });
        room.on('removeStream', (_stream) => {
            console.log('room.on(\'removeStream\')');
            this.props.update({
                remoteStreams: {remove: _stream}
            });
        });
        room.on('close', () => {
            console.log('room.on(\'close\')');
        });
        room.on('peerJoin', (id) => {
            console.log('room.on(\'peerJoin\')');
            console.log(id);
            if (this.props.mode === 'speaker') {
                room.send(this.props.talkingPeer);
            }
        });
        room.on('peerLeave', (id) => {
            console.log('room.on(\'peerLeave\')');
            console.log(id);
        });
        room.on('data', (msg) => {
            console.log('room.on(\'data\')');
            console.log(msg);
            let state = {};
            switch (this.props.mode) {
                case 'speaker':
                    if (msg.data === 'waiting') {
                        state.waitingPeers = {add: msg.src};
                    } else if (msg.data === 'none') {
                        state.waitingPeers = {remove: msg.src};
                        state.talkingPeer = undefined;
                    }
                    break;
                case 'audience':
                    if (msg.src !== 'speaker') {
                        return;
                    }
                    if (this.props.talkingPeer === msg.data) {
                        return;
                    }
                    const isTalking = (this.props.talkingStatus === 'talking');
                    const willDisconnect = (!msg.data) || (msg.data !== this.props.myPeerId);
                    const willTalk = (msg.data === this.props.myPeerId);
                    if (isTalking && willDisconnect) {
                        state.talkingStatus = 'none';
                        this.props.localStream.getAudioTracks().forEach((track) => {
                            track.enabled = false;
                        });
                        this.props.localStream.getVideoTracks().forEach((track) => {
                            track.enabled = false;
                        });
                    }
                    if (!isTalking && willTalk) {
                        state.talkingStatus = 'talking';
                        this.props.localStream.getAudioTracks().forEach((track) => {
                            track.enabled = true;
                        });
                    }
                    state.talkingPeer = msg.data;
                    break;
                default:
                    break;
            }
            if (Object.keys(state).length > 0) {
                this.props.update(state);
            }
        });
        // skyway.js seems to close beforehand.
        /*
        window.addEventListener('beforeunload', () => {
            room.close();
            console.log('window.on(\'beforeunload\')');
        }, false);
        */
    }
    connectToSkyWay.bind(this)(myPeerId, width, height, framerate, isMuted);
}

export default App;
