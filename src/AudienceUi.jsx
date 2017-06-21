import React, { Component } from 'react';
import Video from './Video';
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
        this.timerNoSpeaker = setTimeout(() => {
            this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_NO_SPEAKER}]);
        }, CONST.TIMEOUT_MILLISECONDS_ALERT_NO_SPEAKER);
    }
    render() {
        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            webinar.receive.bind(this)();
        }
        const remoteVideo = this.props.remoteStreams.map(stream => {
            const url = URL.createObjectURL(stream);
            let isSpeaker = stream.peerId === this.props.roomName + '-' + CONST.SPEAKER_PEER_ID;
            if (!isSpeaker) {
                return false;
            }
            clearTimeout(this.timerNoSpeaker);
            return (
                <Video
                    muted={false}
                    className="camera"
                    src={url}
                />
            );
        });
        return (
            <div id="AudienceUi">
                { remoteVideo }
            </div>
        );
    }
}

export default AudienceUi;