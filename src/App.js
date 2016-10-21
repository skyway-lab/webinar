import React, { Component } from 'react';
import './App.css';
import { Button, ButtonGroup, Glyphicon } from 'react-bootstrap';

class App extends Component {
    constructor (props) {
        super(props);
        this.state = {
            mode: null,
            localStream: null,
            cameraStream: null,
            screenStream: null,
            screenShare: null,
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
        const cameraStream = newState.hasOwnProperty('cameraStream') ? newState.cameraStream : this.state.cameraStream;
        const screenStream = newState.hasOwnProperty('screenStream') ? newState.screenStream : this.state.screenStream;
        const screenShare = newState.screenShare ? newState.screenShare : this.state.screenShare;
        let remoteStreams = this.state.remoteStreams;
        if (newState.remoteStreams && newState.remoteStreams.add) {
            remoteStreams.push(newState.remoteStreams.add);
        }
        if (newState.remoteStreams && newState.remoteStreams.remove) {
            remoteStreams = remoteStreams.filter(stream => {
                return stream !== newState.remoteStreams.remove;
            });
        }
        let waitingPeers = this.state.waitingPeers;
        if (newState.waitingPeers && newState.waitingPeers.add) {
            waitingPeers.push(newState.waitingPeers.add);
        }
        if (newState.waitingPeers && newState.waitingPeers.remove) {
            waitingPeers = waitingPeers.filter(remotePeerId => {
                return remotePeerId !== newState.waitingPeers.remove;
            });
        }
        const talkingPeer = newState.hasOwnProperty('talkingPeer') ? newState.talkingPeer : this.state.talkingPeer;
        const talkingStatus = newState.talkingStatus ? newState.talkingStatus : this.state.talkingStatus;
        const room = newState.room ? newState.room : this.state.room;
        const myPeerId = newState.myPeerId ? newState.myPeerId : this.state.myPeerId;
        const state = {
            mode,
            localStream,
            cameraStream,
            screenStream,
            screenShare,
            remoteStreams,
            waitingPeers,
            talkingPeer,
            talkingStatus,
            room,
            myPeerId
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
                    cameraStream={this.state.cameraStream}
                    screenStream={this.state.screenStream}
                    screenShare={this.state.screenShare}
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
                <LocalVideo
                    localStream={this.props.localStream}
                    cameraStream={this.props.cameraStream}
                    screenStream={this.props.screenStream} />
                <Config
                    room={this.props.room}
                    update={this.props.update}
                    localStream={this.props.localStream}
                    cameraStream={this.props.cameraStream}
                    screenStream={this.props.screenStream}
                    screenShare={this.props.screenShare} />
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
        let className;
        if (this.props.localStream && this.props.screenStream && this.props.localStream === this.props.screenStream) {
            className = 'screen';
        } else {
            className = 'camera';
        }
        const url = URL.createObjectURL(this.props.localStream);
        return (
            <div id="LocalVideo">
                <video autoPlay muted src={url} className={className} />
            </div>
        );
    }
}

class RemoteVideos extends Component {
    render () {
        const target = this.props.target;
        const remoteStreamNodes = this.props.remoteStreams.map(stream => {
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
                this.props.localStream.getAudioTracks().forEach(track => {
                    track.enabled = false;
                });
                this.props.localStream.getVideoTracks().forEach(track => {
                    track.enabled = false;
                });
                break;
            case 'waiting':
                state.talkingStatus = 'waiting';
                this.props.room.send('waiting');
                this.props.localStream.getVideoTracks().forEach(track => {
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
    _onClick (event) {
        if (event.currentTarget.id === 'camera') {
            if (this.props.localStream === this.props.cameraStream) {
                return;
            }
            this.props.localStream.getTracks().forEach(track => {
                track.stop();
            });
            return;
        }

        if (this.props.screenStream === this.props.cameraStream) {
            return;
        }

        const screenShare = this.props.screenShare || new SkyWay.ScreenShare({debug: true});
        if (!this.props.screenShare) {
            this.props.update({ screenShare });
        }

        function successScreenShare (stream) {
            console.log('successed screenshare');
            this.props.room.replaceStream(stream);
            this.props.update({
                localStream: stream,
                screenStream: stream
            });
        }

        function failScreenShare (err) {
            console.error('[error in starting screen share]', err);
        }

        function stopScreenShare () {
            console.log('stop screen share');
            this.props.room.replaceStream(this.props.cameraStream);
            this.props.update({ localStream: this.props.cameraStream });
        }

        function startScreenShareFirst() {
            screenShare.startScreenShare({
                Width: 1920,
                Height: 1080,
                FrameRate: 5
            }, successScreenShare.bind(this), failScreenShare.bind(this), stopScreenShare.bind(this));
        }

        function startScreenShare() {
            screenShare.startScreenShare({
                Width: 1920,
                Height: 1080,
                FrameRate: 5
            }, () => {}, () => {}, () => {});
        }

        function installExtension() {
            chrome.webstore.install('', () => {
                console.log('succeeded to install extension');
            }, ev => {
                console.error('[error in installing extension]', ev);
            });

            window.addEventListener('message', function(ev) {
                if(ev.data.type === "ScreenShareInjected") {
                    console.log('screen share extension is injected, get ready to use');
                    startScreenShareFirst.bind(this)();
                }
            }, false);
        }


        if (screenShare.isEnabledExtension()) {
            if (!this.props.screenShare) {
                startScreenShareFirst.bind(this)();
            } else {
                startScreenShare.bind(this)();
            }
        } else {
            installExtension();
        }
    }
    render () {
        if (!this.props.localStream || this.props.localStream === this.props.cameraStream) {
            return (
                <div id="Config">
                    <h2>Video Source</h2>
                    <ButtonGroup>
                        <Button id="camera" title="Camera" disabled><Glyphicon glyph="facetime-video" /></Button>
                        <Button id="screen" title="Screen" onClick={this._onClick.bind(this)}><Glyphicon glyph="list-alt" /></Button>
                    </ButtonGroup>
                </div>
            );
        }
        return (
            <div id="Config">
                <h2>Video Source</h2>
                <ButtonGroup>
                    <Button id="camera" title="Camera" onClick={this._onClick.bind(this)}><Glyphicon glyph="facetime-video" /></Button>
                    <Button id="screen" title="Screen" disabled><Glyphicon glyph="list-alt" /></Button>
                </ButtonGroup>
            </div>
        );
    }
}

function webinar(myPeerId, width, height, framerate, isMuted) {
    let peer;
    function _connectToSkyWay(_myPeerId, _width, _height, _framerate, _isMuted) {
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
            _showLocalVideo.bind(this)(_width, _height, _framerate, _isMuted);
            this.props.update({ myPeerId: peer.id });
        });
        peer.on('error', err => {
            console.error(err.message);
        });
    }
    function _showLocalVideo(__width, __height, __framerate, __isMuted) {
        const videoConstraints = {
            width: { max: __width },
            height: { max: __height },
            frameRate: 5,
            facingMode: 'user'
        };
        navigator.mediaDevices.getUserMedia({audio: true, video: videoConstraints})
        .then(stream => {
            if (isMuted) {
                stream.getAudioTracks().forEach(track => {
                    track.enabled = false;
                });
                stream.getVideoTracks().forEach(track => {
                    track.enabled = false;
                });
            }
            this.props.update({
                localStream: stream,
                cameraStream: stream
            });
            _showRemoteVideo.bind(this)(stream);
        }).catch(err => {
            console.error(err);
        });
    }
    function _showRemoteVideo(_stream) {
        const roomName = this.props.roomName;
        const room = peer.joinRoom(roomName, { mode: 'sfu', stream: _stream });
        this.props.update({ room });
        room.on('stream', (_stream) => {
            console.log('room.on(\'stream\')');
            this.props.update({ remoteStreams: { add: _stream } });
        });
        room.on('removeStream', (_stream) => {
            console.log('room.on(\'removeStream\')');
            this.props.update({ remoteStreams: { remove: _stream } });
        });
        room.on('close', () => {
            console.log('room.on(\'close\')');
        });
        room.on('peerJoin', id => {
            console.log('room.on(\'peerJoin\')');
            console.log(id);
            if (this.props.mode === 'speaker') {
                room.send(this.props.talkingPeer);
            }
        });
        room.on('peerLeave', id => {
            console.log('room.on(\'peerLeave\')');
            console.log(id);
        });
        room.on('data', msg => {
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
                        this.props.localStream.getAudioTracks().forEach(track => {
                            track.enabled = false;
                        });
                        this.props.localStream.getVideoTracks().forEach(track => {
                            track.enabled = false;
                        });
                    }
                    if (!isTalking && willTalk) {
                        state.talkingStatus = 'talking';
                        this.props.localStream.getAudioTracks().forEach(track => {
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
        room.on('log', logs => {console.info(logs)});
        room.getLog();
        // skyway.js seems to close beforehand.
        /*
        window.addEventListener('beforeunload', () => {
            room.close();
            console.log('window.on(\'beforeunload\')');
        }, false);
        */
    }
    _connectToSkyWay.bind(this)(myPeerId, width, height, framerate, isMuted);
}

export default App;
