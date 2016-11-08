import React, { Component } from 'react';
import { IndexRoute, Link, Router, Route, browserHistory } from 'react-router';
import RemoteVideos from './RemoteVideos';
import LocalVideo from './LocalVideo';
import CONST from './Const';
import webinar from './webinar';
import './AudienceUi.css';

class AudienceUi extends Component {
    constructor(props) {
        super(props);
        this.isWebinarStarted = false;
        this.props.update([
            { op: 'replace', path: '/mode', value: CONST.ROLE_AUDIENCE },
            { op: 'replace', path: '/roomName', value: this.props.params.roomName}
        ]);
        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            webinar.bind(this)(null, CONST.AUDIENCE_CAMERA_WIDTH, CONST.AUDIENCE_CAMERA_HEIGHT, CONST.AUDIENCE_CAMERA_FRAME_RATE, true);
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