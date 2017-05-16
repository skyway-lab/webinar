import React, { Component } from 'react';
import { IndexRoute, Link, Router, Route, browserHistory } from 'react-router';
import RemoteVideos from './RemoteVideos';
import LocalVideo from './LocalVideo';
import getCameraStream from './getCameraStream';
import connectToSkyWay from './connectToSkyWay';
import joinRoom from './joinRoom';
import CONST from './Const';
import './AudienceUi.css';

class AudienceUi extends Component {
    constructor(props) {
        super(props);
        this.isWebinarStarted = false;
        this.props.update([
            { op: 'replace', path: '/mode', value: CONST.ROLE_AUDIENCE },
            { op: 'replace', path: '/roomName', value: this.props.params.roomName}
        ]);

        function _webinar(myPeerId, width, height, frameRate, isMuted) {
            const _joinRoom = joinRoom.bind(this);
            connectToSkyWay.bind(this)(myPeerId, () => {
                const isFinishedGetCameraStream = !!(this.props.localStream);
                if (!isFinishedGetCameraStream) {
                    return;
                }
                _joinRoom();
            });
            getCameraStream.bind(this)(width, height, frameRate, isMuted, () => {
                const isFinishedConnectToSkyWay = !!(this.props.peer);
                if (!isFinishedConnectToSkyWay) {
                    return;
                }
                _joinRoom();
            });
        }

        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            _webinar.bind(this)(null, CONST.AUDIENCE_CAMERA_WIDTH, CONST.AUDIENCE_CAMERA_HEIGHT, CONST.AUDIENCE_CAMERA_FRAME_RATE, true);
        }
    }
    render() {
        let localVideo;
        let questionerVideo;
        if (this.props.talkingStatus !== CONST.QA_STATUS_DO_NOTHING) {
            localVideo = (
                <LocalVideo
                    localStream={this.props.localStream}
                    mode={this.props.mode}
                />
            );
        }
        if (this.props.talkingPeer) {
            questionerVideo = (
                <RemoteVideos
                    remoteStreams={this.props.remoteStreams}
                    talkingPeer={this.props.talkingPeer}
                    opponent={CONST.ROLE_QUESTIONER}
                />
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
                    room={this.props.room}
                />
                {localVideo}
                {questionerVideo}
            </div>
        );
    }
}

export default AudienceUi;