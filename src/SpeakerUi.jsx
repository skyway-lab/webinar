import React, { Component } from 'react';
import RemoteVideos from './RemoteVideos';
import LocalVideo from './LocalVideo';
import CONST from './Const';
import webinar from './webinar';
import getDevices from './getDevices';
import './SpeakerUi.css';

class SpeakerUi extends Component {
    constructor(props) {
        super(props);
        this.isWebinarStarted = false;
        this.props.update([
            { op: 'replace', path: '/mode', value: CONST.ROLE_SPEAKER },
            { op: 'replace', path: '/roomName', value: this.props.params.roomName}
        ]);
        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            webinar.bind(this)(CONST.SPEAKER_PEER_ID, CONST.SPEAKER_CAMERA_WIDTH, CONST.SPEAKER_CAMERA_HEIGHT, CONST.SPEAKER_CAMERA_FRAME_RATE, false);
            getDevices.bind(this)();
        }
    }
    render() {
        return (
            <div id="SpeakerUi">
                <LocalVideo
                    alerts={this.props.alerts}
                    room={this.props.room}
                    update={this.props.update}
                    localStream={this.props.localStream}
                    cameraStream={this.props.cameraStream}
                    screenStream={this.props.screenStream}
                    screenShare={this.props.screenShare}
                    mode={this.props.mode}
                    devices={this.props.devices}
                    cameraId={this.props.cameraId}
                    microphoneId={this.props.microphoneId}
                    speakerId={this.props.speakerId}
                />
                <RemoteVideos
                    remoteStreams={this.props.remoteStreams}
                    opponent={CONST.ROLE_AUDIENCE}
                    waitingPeers={this.props.waitingPeers}
                    talkingPeer={this.props.talkingPeer}
                    room={this.props.room}
                    update={this.props.update}
                />
            </div>
        );
    }
}

export default SpeakerUi;