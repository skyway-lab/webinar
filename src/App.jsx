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
        const index = Math.floor(Math.random() * CONST.ROOM_NAME_WORDS.length);
        this.state = {
            alerts: [],
            mode: null,
            roomName: CONST.ROOM_NAME_WORDS[index] + '-webinar',
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
    update(patches) {
        let state = this.state;
        jsonpatch.apply(state, patches);
        this.setState(state);
    }
    render() {
        switch (this.state.mode) {
            case CONST.ROLE_SPEAKER:
                return (
                    <div className="App">
                        <Alerts
                            update={this.update}
                            alerts={this.state.alerts}
                        />
                        <SpeakerUi
                            alerts={this.state.alerts}
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
                            room={this.state.room}
                        />
                    </div>
                );
            case CONST.ROLE_AUDIENCE:
                return (
                    <div className="App">
                        <Alerts
                            update={this.update}
                            alerts={this.state.alerts}
                        />
                        <AudienceUi
                            alerts={this.state.alerts}
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
                            myPeerId={this.state.myPeerId}
                        />
                    </div>
                );
        }
        return (
            <div className="App">
                <Alerts
                    update={this.update}
                    alerts={this.state.alerts}
                />
                <SelectMode
                    update={this.update}
                    mode={this.state.mode}
                />
            </div>
        );
    }
}

export default App;
