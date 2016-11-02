import React, { Component } from 'react';
import RemoteVideos from './RemoteVideos';
import LocalVideo from './LocalVideo';
import CONST from './Const';
import webinar from './webinar';
import './AudienceUi.css';

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

export default AudienceUi;