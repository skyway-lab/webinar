import React, { Component } from 'react';
import RemoteVideos from './RemoteVideos';
import LocalVideo from './LocalVideo';
import CONST from './Const';
import getCameraStream from './getCameraStream';
import connectToSkyWay from './connectToSkyWay';
import joinRoom from './joinRoom';
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

        function _webinar(myPeerId, width, height, frameRate, isMuted) {
            getDevices.bind(this)();
            const _joinRoom = joinRoom.bind(this);
            connectToSkyWay.bind(this)(myPeerId, () => {
                const isFinishedGetCameraStream = !!(this.props.localStream);
                if (!isFinishedGetCameraStream) {
                    return;
                }
                getDevices.bind(this)();
                _joinRoom();
            });
            getCameraStream.bind(this)(width, height, frameRate, isMuted, () => {
                const isFinishedConnectToSkyWay = !!(this.props.peer);
                if (!isFinishedConnectToSkyWay) {
                    return;
                }
                getDevices.bind(this)();
                _joinRoom();
            });
        }

        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            _webinar.bind(this)(this.props.roomName + '-' + CONST.SPEAKER_PEER_ID, CONST.SPEAKER_CAMERA_WIDTH, CONST.SPEAKER_CAMERA_HEIGHT, CONST.SPEAKER_CAMERA_FRAME_RATE, false);
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
                    videoInId={this.props.videoInId}
                    audioInId={this.props.audioInId}
                    audioOutId={this.props.audioOutId}
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