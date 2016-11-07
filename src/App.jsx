import React, { Component } from 'react';
import { IndexRoute, Link, Router, Route, browserHistory } from 'react-router';
import SpeakerUi from './SpeakerUi';
import AudienceUi from './AudienceUi';
import Alerts from './Alerts';
import SelectMode from './SelectMode';
import CONST from './Const';
import jsonpatch from 'fast-json-patch';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: [],
            mode: null,
            roomName: '',
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
            myPeerId: null,
            devices: []
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
    update(patches) {
        let state = this.state;
        jsonpatch.apply(state, patches);
        this.setState(state);
    }
    render() {
        return (
            <div className="App">
                <Alerts
                    update={this.update}
                    alerts={this.state.alerts}
                />
                {React.cloneElement(this.props.children, {
                    alerts: this.state.alerts,
                    mode: this.state.mode,
                    roomName: this.state.roomName,
                    localStream: this.state.localStream,
                    cameraStream: this.state.cameraStream,
                    screenStream: this.state.screenStream,
                    screenShare: this.state.screenShare,
                    remoteStreams: this.state.remoteStreams,
                    speakerStreamKind: this.state.speakerStreamKind,
                    waitingPeers: this.state.waitingPeers,
                    talkingPeer: this.state.talkingPeer,
                    talkingStatus: this.state.talkingStatus,
                    room: this.state.room,
                    myPeerId: this.state.myPeerId,
                    devices: this.state.devices,
                    update: this.update
                })}
            </div>
        );
    }
}

export default App;
