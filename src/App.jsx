import React, { Component } from 'react';
import SpeakerUi from './SpeakerUi';
import AudienceUi from './AudienceUi';
import Alerts from './Alerts';
import SelectMode from './SelectMode';
import CONST from './Const';
import './App.css';

class App extends Component {
    constructor(props) {
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
    update(newState) {
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
        switch (this.state.mode) {
            case CONST.ROLE_SPEAKER:
                return (
                    <div className="App">
                        <Alerts
                            update={this.update}
                            alerts={this.state.alerts}
                        />
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
