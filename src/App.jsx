import React, { Component } from 'react';
import { IndexRoute, Link, Router, Route, browserHistory } from 'react-router';
import SpeakerUi from './SpeakerUi';
import AudienceUi from './AudienceUi';
import Alerts from './Alerts';
import SelectMode from './SelectMode';
import CONST from './const';
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
            remoteStreams: [],
            room: null,
            myPeerId: null,
            devices: [],
            videoInId: null,
            audioInId: null
        };
        const isSupportedWebRTC = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.RTCPeerConnection;
        if (!isSupportedWebRTC) {
            this.state.alerts.push(CONST.ALERT_KIND_NOT_SUPPORT_WEBRTC);
        }
        this.update = this.update.bind(this); // es6対応、ここで実行するわけではない(最後に () がない)
        window.onhashchange = () => {
            console.log('window.onhashchange');
            if (!!location.hash) {
                location.reload();
            }
        };
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
                    remoteStreams: this.state.remoteStreams,
                    room: this.state.room,
                    myPeerId: this.state.myPeerId,
                    devices: this.state.devices,
                    videoInId: this.state.videoInId,
                    audioInId: this.state.audioInId,
                    update: this.update
                })}
            </div>
        );
    }
}

export default App;
