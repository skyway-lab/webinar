import React, { Component } from 'react';
import RemoteVideos from './RemoteVideos';
import LocalVideo from './LocalVideo';
import CONST from './Const';
import webinar from './webinar';
import './SpeakerUi.css';

class SpeakerUi extends Component {
    constructor(props) {
        super(props);
        this.isWebinarStarted = false;
    }
    render() {
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
                    mode={this.props.mode}
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