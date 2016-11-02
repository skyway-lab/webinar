import React, { Component } from 'react';
import './App.css';
import { Button, ButtonGroup, Glyphicon, Alert, Grid, Row, Col } from 'react-bootstrap';
import CONST from './constants';

class App extends Component {
    constructor (props) {
        super(props);
        this.state = {
            alerts: [],
            mode: null,
            localStream: null,
            cameraStream: null,
            screenStream: null,
            screenShare: null,
            remoteStreams: [],
            speakerStreamKind: CONST.STREAM_KIND_CAMERA,
            waitingPeers: [],
            talkingPeer: null,
            talkingStatus: CONST.QA_STATUS_DO_NOTHING,
            room: null,
            myPeerId: null
        };
        const isSupportedWebRTC = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.RTCPeerConnection;
        if (!isSupportedWebRTC) {
            this.state.alerts.push(CONST.ALERT_KIND_NOT_SUPPORT_WEBRTC);
        }
        const isSupportedPlanB = window.webkitRTCPeerConnection;
        if (isSupportedWebRTC && !isSupportedPlanB) {
            this.state.alerts.push(CONST.ALERT_KIND_UNSTABLE_SFU);
        }
        this.update = this.update.bind(this); // es6対応、ここで実行するわけではない(最後に () がない)
    }
    update (newState) {
        let alerts = this.state.alerts;
        if (newState.alerts && newState.alerts.add) {
            alerts.push(newState.alerts.add);
        }
        if (newState.alerts && newState.alerts.remove) {
            alerts = alerts.filter(alert => alert !== newState.alerts.remove);
        }
        const mode = newState.mode ? newState.mode : this.state.mode;
        const localStream = newState.localStream ? newState.localStream : this.state.localStream;
        const cameraStream = newState.cameraStream ? newState.cameraStream : this.state.cameraStream;
        const screenStream = newState.screenStream ? newState.screenStream : this.state.screenStream;
        const screenShare = newState.screenShare ? newState.screenShare : this.state.screenShare;
        let remoteStreams = this.state.remoteStreams;
        if (newState.remoteStreams && newState.remoteStreams.add) {
            remoteStreams.push(newState.remoteStreams.add);
        }
        if (newState.remoteStreams && newState.remoteStreams.remove) {
            remoteStreams = remoteStreams.filter(stream => stream !== newState.remoteStreams.remove);
        }
        const speakerStreamKind = newState.speakerStreamKind ? newState.speakerStreamKind : this.state.speakerStreamKind;
        let waitingPeers = this.state.waitingPeers;
        if (newState.waitingPeers && newState.waitingPeers.add) {
            waitingPeers.push(newState.waitingPeers.add);
        }
        if (newState.waitingPeers && newState.waitingPeers.remove) {
            waitingPeers = waitingPeers.filter(remotePeerId => remotePeerId !== newState.waitingPeers.remove);
        }

        // don't evaluate newState.talkingPeer because newStage.talkingPeer may change to null
        const talkingPeer = newState.hasOwnProperty('talkingPeer') ? newState.talkingPeer : this.state.talkingPeer;

        const talkingStatus = newState.talkingStatus ? newState.talkingStatus : this.state.talkingStatus;
        const room = newState.room ? newState.room : this.state.room;
        const myPeerId = newState.myPeerId ? newState.myPeerId : this.state.myPeerId;
        const state = {
            alerts,
            mode,
            localStream,
            cameraStream,
            screenStream,
            screenShare,
            remoteStreams,
            speakerStreamKind,
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
                <Alerts
                    update={this.update}
                    alerts={this.state.alerts} />
                <SelectMode
                    update={this.update}
                    mode={this.state.mode} />
                <SpeakerUi
                    roomName={CONST.ROOM_NAME}
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
                    roomName={CONST.ROOM_NAME}
                    update={this.update}
                    mode={this.state.mode}
                    localStream={this.state.localStream}
                    remoteStreams={this.state.remoteStreams}
                    speakerStreamKind={this.state.speakerStreamKind}
                    waitingPeers={this.state.waitingPeers}
                    talkingPeer={this.state.talkingPeer}
                    room={this.state.room}
                    talkingStatus={this.state.talkingStatus}
                    myPeerId={this.state.myPeerId} />
            </div>
        );
    }
}

class Alerts extends Component {
    _handleAlertDismiss() {
        this.props.update({ alerts: { remove: CONST.ALERT_KIND_UNSTABLE_SFU } });
    }
    _reload() {
        location.reload();
    }
    render () {
        let notSupportedWebRTC;
        if (this.props.alerts.includes(CONST.ALERT_KIND_NOT_SUPPORT_WEBRTC)) {
            notSupportedWebRTC = (
                <Alert bsStyle="danger">
                    SkyWay Webinar doesn't suport your browser because your browser doesn't support WebRTC.
                    Would you use <a href="https://www.google.co.jp/chrome/">Google Chrome</a>?
                </Alert>
            );
        }
        let unstableSFU;
        if (this.props.alerts.includes(CONST.ALERT_KIND_UNSTABLE_SFU)) {
            unstableSFU = (
                <Alert bsStyle="warning" onDismiss={this._handleAlertDismiss.bind(this)}>
                    Currently, Firefox are unstable in using SKyWay Webinar and we are fixing problems.
                    So we recommend <a href="https://www.google.co.jp/chrome/">Google Chrome</a> now.
                </Alert>
            );
        }
        let gUM;
        if (this.props.alerts.includes(CONST.ALERT_KIND_GUM)) {
            gUM = (
                <Alert bsStyle="danger">
                    <p>
                        SkyWay Webinar use microphone and camera, even if you are just watching.
                        Anybody never see your audio and video unless you don't question.
                        Would you allow to use?
                    </p>
                    <p>
                        You have to reload this page if you deny onece.
                    </p>
                    <p>
                        <Button bsStyle="danger" onClick={this._reload}>Reload</Button>
                    </p>
                </Alert>
            );
        }
        let roomPermission;
        if (this.props.alerts.includes(CONST.ALERT_KIND_ROOM_PERMISSION)) {
            roomPermission = (
                <Alert bsStyle="danger">
                    <p>
                        An error has occured in SkyWay Room API.
                        This error sometimes happens because the API is still alpha version.
                        Could you reload the page?
                    </p>
                    <p>
                        <Button bsStyle="danger" onClick={this._reload}>Reload</Button>
                    </p>
                </Alert>
            );
        }
        if (notSupportedWebRTC || unstableSFU || gUM || roomPermission) {
            return (
                <div id="Alerts">
                    <Grid fluid={true}>
                        <Row>
                            <Col xs={12} sm={5} smOffset={7} md={4} mdOffset={8} lg={3} lgOffset={9}>
                                {notSupportedWebRTC}
                                {unstableSFU}
                                {gUM}
                                {roomPermission}
                            </Col>
                        </Row>
                    </Grid>
                </div>
            );
        }
        return (
            <div></div>
        );
    }
}

class SelectMode extends Component {
    _onClick (event) {
        const mode = event.target.value;
        this.props.update({ mode });
    }
    render () {
        if (!this.props.mode) {
            return (
                <div id="SelectMode">
                    <h1>SkyWay Webinar</h1>
                    <div className="button-container">
                        <button value={CONST.ROLE_SPEAKER} onClick={this._onClick.bind(this)}>Speaker</button>
                        <button value={CONST.ROLE_AUDIENCE} onClick={this._onClick.bind(this)}>Audience</button>
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
        if (this.props.mode !== CONST.ROLE_SPEAKER) {
            return false;
        }
        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            webinar.bind(this)(CONST.SPEAKER_PEER_ID, 1280, 720, 5, false);
        }
        return (
            <div id="SpeakerUi">
                <LocalVideo
                    room={this.props.room}
                    update={this.props.update}
                    localStream={this.props.localStream}
                    cameraStream={this.props.cameraStream}
                    screenStream={this.props.screenStream}
                    screenShare={this.props.screenShare}
                    mode={this.props.mode} />
                <RemoteVideos
                    remoteStreams={this.props.remoteStreams}
                    opponent={CONST.ROLE_AUDIENCE}
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
        if (this.props.mode !== CONST.ROLE_AUDIENCE) {
            return false;
        }
        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            webinar.bind(this)(null, 160, 90, 1, true);
        }
        if (this.props.talkingStatus === CONST.QA_STATUS_DO_NOTHING) {
            return (
                <div id="AudienceUi">
                    <RemoteVideos
                        localStream={this.props.localStream}
                        remoteStreams={this.props.remoteStreams}
                        speakerStreamKind={this.props.speakerStreamKind}
                        opponent={CONST.ROLE_SPEAKER}
                        waitingPeers={this.props.waitingPeers}
                        talkingPeer={this.props.talkingPeer}
                        update={this.props.update}
                        talkingStatus={this.props.talkingStatus}
                        room={this.props.room} />
                    <RemoteVideos
                        remoteStreams={this.props.remoteStreams}
                        talkingPeer={this.props.talkingPeer}
                        opponent={CONST.ROLE_QUESTIONER} />
                </div>
            );
        }

        return (
            <div id="AudienceUi">
                <RemoteVideos
                    localStream={this.props.localStream}
                    remoteStreams={this.props.remoteStreams}
                    speakerStreamKind={this.props.speakerStreamKind}
                    opponent={CONST.ROLE_SPEAKER}
                    waitingPeers={this.props.waitingPeers}
                    talkingPeer={this.props.talkingPeer}
                    update={this.props.update}
                    talkingStatus={this.props.talkingStatus}
                    room={this.props.room} />
                <LocalVideo
                    localStream={this.props.localStream}
                    mode={this.props.mode} />
                <RemoteVideos
                    remoteStreams={this.props.remoteStreams}
                    talkingPeer={this.props.talkingPeer}
                    opponent={CONST.ROLE_QUESTIONER} />
            </div>
        );
    }
}

class LocalVideo extends Component {
    render () {
        if (!this.props.localStream) {
            return false;
        }
        let title;
        let className;
        let config;
        if (this.props.mode === CONST.ROLE_SPEAKER) {
            title = (
                <h2><span>ON AIR</span></h2>
            );
            const hasScreenStream = !!(this.props.screenStream);
            const doesScreenStreamUsed = this.props.localStream === this.props.screenStream;
            if (hasScreenStream && doesScreenStreamUsed) {
                className = 'screen';
            } else {
                className = 'camera';
            }
            config = (
                <Config
                    room={this.props.room}
                    update={this.props.update}
                    localStream={this.props.localStream}
                    cameraStream={this.props.cameraStream}
                    screenStream={this.props.screenStream}
                    screenShare={this.props.screenShare} />
            );
        }
        const url = URL.createObjectURL(this.props.localStream);
        return (
            <div id="LocalVideo">
                {title}
                <Video
                    muted={true}
                    src={url}
                    className={className} />
                {config}
            </div>
        );
    }
}

class RemoteVideos extends Component {
    render () {
        let className;
        switch (this.props.opponent) {
            case CONST.ROLE_SPEAKER:
                className = 'speaker';
                break;
            case CONST.ROLE_AUDIENCE:
                className = 'audience';
                break;
            case CONST.ROLE_QUESTIONER:
                className = 'questioner';
                break;
            default:
                break;
        }
        let title;
        if (this.props.opponent === CONST.ROLE_AUDIENCE) {
            title = (
                <h2><span>Audience</span></h2>
            );
        }
        return (
            <div className={"remote-videos remote-videos-" + className}>
                {title}
                {this.props.remoteStreams.map(stream => (
                    <RemoteVideo
                        opponent={this.props.opponent}
                        localStream={this.props.localStream}
                        update={this.props.update}
                        talkingStatus={this.props.talkingStatus}
                        waitingPeers={this.props.waitingPeers}
                        talkingPeer={this.props.talkingPeer}
                        room={this.props.room}
                        speakerStreamKind={this.props.speakerStreamKind}
                        stream={stream} />
                ))}
            </div>
        );
    }
}

class RemoteVideo extends Component {
    render () {
        const stream = this.props.stream;
        const url = URL.createObjectURL(stream);
        let question;
        let answer;
        switch (this.props.opponent) {
            case CONST.ROLE_SPEAKER:
                let isSpeaker = stream.peerId === CONST.SPEAKER_PEER_ID;
                if (!isSpeaker) {
                    return false;
                }
                question = (
                    <Question
                        localStream={this.props.localStream}
                        update={this.props.update}
                        talkingStatus={this.props.talkingStatus}
                        room={this.props.room} />
                );
                break;
            case CONST.ROLE_AUDIENCE:
                answer = (
                    <Answer
                        remotePeerId={stream.peerId}
                        waitingPeers={this.props.waitingPeers}
                        talkingPeer={this.props.talkingPeer}
                        room={this.props.room}
                        update={this.props.update} />
                );
                break;
            case CONST.ROLE_QUESTIONER:
                let isQuestioner = stream.peerId === this.props.talkingPeer;
                if (!isQuestioner) {
                    return false;
                }
                break;
            default:
                return false;
                break;
        }
        let className;
        switch (this.props.speakerStreamKind) {
            case CONST.STREAM_KIND_CAMERA:
                className = 'camera';
                break;
            case CONST.STREAM_KIND_SCREEN:
                className = 'screen';
                break;
            default:
                break;
        }
        return (
            <div className="remote-video">
                {question}
                {answer}
                <Video
                    muted={false}
                    className={className}
                    src={url} />
            </div>
        );
    }
}

class Question extends Component {
    _onClick (event) {
        const newStatus = event.target.value;
        let state = {};
        switch (newStatus) {
            case CONST.QA_STATUS_DO_NOTHING:
                state.talkingStatus = CONST.QA_STATUS_DO_NOTHING;
                state.talkingPeer = null;
                this.props.room.send({ talkingStatus: CONST.QA_STATUS_DO_NOTHING });
                this.props.localStream.getAudioTracks().forEach(track => {
                    track.enabled = false;
                });
                this.props.localStream.getVideoTracks().forEach(track => {
                    track.enabled = false;
                });
                break;
            case CONST.QA_STATUS_WAITING:
                state.talkingStatus = CONST.QA_STATUS_WAITING;
                this.props.room.send({ talkingStatus: CONST.QA_STATUS_WAITING });
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
        let className;
        let button;
        let newStatus;
        switch (this.props.talkingStatus) {
            case CONST.QA_STATUS_DO_NOTHING:
                className = 'call';
                button = 'Question';
                newStatus = CONST.QA_STATUS_WAITING;
                break;
            case CONST.QA_STATUS_WAITING:
                className = 'cancel';
                button = 'Cancel';
                newStatus = CONST.QA_STATUS_DO_NOTHING;
                break;
            case CONST.QA_STATUS_TALKING:
                className = 'disconnect';
                button = 'Finish';
                newStatus = CONST.QA_STATUS_DO_NOTHING;
                break;
            default:
                return false;
        }
        return (
            <div className="button-wrapper button-wrapper-{className}">
                <button onClick={this._onClick.bind(this)} value={newStatus}>{button}</button>
            </div>
        );
    }
}

class Answer extends Component {
    _onClick (event) {
        const remotePeerId = this.props.remotePeerId;
        const newStatus = event.target.value;
        let talkingPeer = this.props.talkingPeer;
        let waitingPeers = this.props.waitingPeers;
        switch (newStatus) {
            case CONST.QA_STATUS_DO_NOTHING:
                talkingPeer = null;
                waitingPeers = {remove: remotePeerId};
                break;
            case CONST.QA_STATUS_TALKING:
                if (talkingPeer) {
                    waitingPeers = {remove: talkingPeer};
                }
                talkingPeer = remotePeerId;
                break;
            default:
                break;
        }
        this.props.room.send({ talkingPeer });
        this.props.update({ talkingPeer, waitingPeers });
    }
    render () {
        const remotePeerId = this.props.remotePeerId;
        const waitingPeers = this.props.waitingPeers;
        const talkingPeer = this.props.talkingPeer;
        const isOpponentTalking = talkingPeer === remotePeerId;
        const isOpponentWaiting = waitingPeers && waitingPeers.includes(remotePeerId);
        let className;
        let message;
        let newStatus;
        let label;
        if (isOpponentTalking) {
            className = 'disconnect';
            message = 'Questioning';
            newStatus = CONST.QA_STATUS_DO_NOTHING;
            label = 'Finish';
        } else if (isOpponentWaiting) {
            className = 'accept';
            message = 'Asking a question';
            newStatus = CONST.QA_STATUS_TALKING;
            label = 'Answer';
        } else {
            className = 'videooff';
            message = 'Just watching';
        }
        let button;
        if (newStatus && label) {
            button = (
                <div className="button-wrapper">
                    <button onClick={this._onClick.bind(this)} value={newStatus}>{label}</button>
                </div>
            );
        }
        return (
            <div className={'answers answers-' + className}>
                <div className="answers-message">
                    {message}
                </div>
                {button}
            </div>
        );
    }
}

class Config extends Component {
    _onClick (event) {
        if (event.currentTarget.value === CONST.STREAM_KIND_CAMERA) {
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
            this.props.room.send({streamKind: CONST.STREAM_KIND_SCREEN});
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
            this.props.room.send({streamKind: CONST.STREAM_KIND_CAMERA});
            this.props.update({ localStream: this.props.cameraStream });
        }

        function startScreenShareFirst() {
            screenShare.startScreenShare({
                FrameRate: 5
            }, successScreenShare.bind(this), failScreenShare.bind(this), stopScreenShare.bind(this));
        }

        function startScreenShare() {
            screenShare.startScreenShare({
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
                    <ButtonGroup>
                        <Button title="Camera" value={CONST.STREAM_KIND_CAMERA} disabled><Glyphicon glyph="facetime-video" /></Button>
                        <Button title="Screen" value={CONST.STREAM_KIND_SCREEN} onClick={this._onClick.bind(this)}><Glyphicon glyph="list-alt" /></Button>
                    </ButtonGroup>
                </div>
            );
        }
        return (
            <div id="Config">
                <ButtonGroup>
                    <Button title="Camera" value={CONST.STREAM_KIND_CAMERA} onClick={this._onClick.bind(this)}><Glyphicon glyph="facetime-video" /></Button>
                    <Button title="Screen" value={CONST.STREAM_KIND_SCREEN} disabled><Glyphicon glyph="list-alt" /></Button>
                </ButtonGroup>
            </div>
        );
    }
}

class Video extends Component {
    render () {
        return (
            <video
                autoPlay
                muted={this.props.muted}
                src={this.props.src}
                className={this.props.className} />
        );
    }
}

function webinar(myPeerId, width, height, frameRate, isMuted) {
    let peer;
    function _connectToSkyWay(_myPeerId, _width, _height, _frameRate, _isMuted) {
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
            _showLocalVideo.bind(this)(_width, _height, _frameRate, _isMuted);
            this.props.update({ myPeerId: peer.id });
        });
        peer.on('error', err => {
            console.error(err.message);
            if (err.message === 'You do not have permission to send to this room') {
                this.props.update({ alerts: { add: CONST.ALERT_KIND_ROOM_PERMISSION } });
            }
        });
    }
    function _showLocalVideo(__width, __height, __frameRate, __isMuted) {
        const videoConstraints = {
            width: __width,
            height: __height,
            frameRate: __frameRate,
            facingMode: 'user'
        };
        navigator.mediaDevices.getUserMedia({audio: true, video: videoConstraints})
        .then(stream => {
            this.props.update({ alerts: { remove: CONST.ALERT_KIND_GUM } });
            clearTimeout(timer);
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
            this.props.update({ alerts: { add: CONST.ALERT_KIND_GUM } });
        });
        const timer = setTimeout(() => {
            this.props.update({ alerts: { add: CONST.ALERT_KIND_GUM } });
        }, 2000);
    }
    function _showRemoteVideo(_stream) {
        const roomName = this.props.roomName;
        const room = peer.joinRoom(roomName, { mode: 'sfu', stream: _stream });
        this.props.update({ room });
        room.on('stream', _stream => {
            console.log('room.on(\'stream\')');
            this.props.update({ remoteStreams: { add: _stream } });
        });
        room.on('removeStream', _stream => {
            console.log('room.on(\'removeStream\')');
            this.props.update({ remoteStreams: { remove: _stream } });
        });
        room.on('close', () => {
            console.log('room.on(\'close\')');
        });
        room.on('peerJoin', id => {
            console.log('room.on(\'peerJoin\')');
            console.log(id);
            if (this.props.mode === CONST.ROLE_SPEAKER) {
                room.send({ talkingPeer: this.props.talkingPeer });
            }
        });
        room.on('peerLeave', id => {
            console.log('room.on(\'peerLeave\'): ', id);
        });
        room.on('data', msg => {
            console.log('room.on(\'data\'): ', msg);
            let state = {};
            switch (this.props.mode) {
                case CONST.ROLE_SPEAKER:
                    if (msg.data.talkingStatus === CONST.QA_STATUS_WAITING) {
                        state.waitingPeers = {add: msg.src};
                    } else if (msg.data.talkingStatus === CONST.QA_STATUS_DO_NOTHING) {
                        state.waitingPeers = {remove: msg.src};
                        state.talkingPeer = undefined;
                    }
                    break;
                case CONST.ROLE_AUDIENCE:
                    if (msg.src !== CONST.SPEAKER_PEER_ID) {
                        return;
                    }
                    if (this.props.talkingPeer === msg.data.talkingPeer) {
                        return;
                    }
                    if (msg.data.streamKind) {
                        state.speakerStreamKind = msg.data.streamKind;
                        break;
                    }
                    if (msg.data.hasOwnProperty('talkingPeer')) {
                        const isTalking = (this.props.talkingStatus === CONST.QA_STATUS_TALKING);
                        const willDisconnect = (msg.data.talkingPeer === null) || (msg.data.talkingPeer !== this.props.myPeerId);
                        const willTalk = (msg.data.talkingPeer === this.props.myPeerId);
                        if (isTalking && willDisconnect) {
                            state.talkingStatus = CONST.QA_STATUS_DO_NOTHING;
                            this.props.localStream.getAudioTracks().forEach(track => {
                                track.enabled = false;
                            });
                            this.props.localStream.getVideoTracks().forEach(track => {
                                track.enabled = false;
                            });
                        }
                        if (!isTalking && willTalk) {
                            state.talkingStatus = CONST.QA_STATUS_TALKING;
                            this.props.localStream.getAudioTracks().forEach(track => {
                                track.enabled = true;
                            });
                        }
                        state.talkingPeer = msg.data.talkingPeer;
                        break;
                    }
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
    _connectToSkyWay.bind(this)(myPeerId, width, height, frameRate, isMuted);
}

export default App;
