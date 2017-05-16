import React, { Component } from 'react';
import Video from './Video';
import CONST from './Const';
import webinar from './webinar';
import './SpeakerUi.css';

class SpeakerUi extends Component {
    constructor(props) {
        super(props);
        this.isWebinarStarted = false;
        this.props.update([
            { op: 'replace', path: '/mode', value: CONST.ROLE_SPEAKER },
            { op: 'replace', path: '/roomName', value: this.props.params.roomName}
        ]);
    }
    render() {
        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            webinar.bind(this)(CONST.SPEAKER_PEER_ID, 1280, 720, 5, false);
        }
        if (!this.props.localStream) {
            return false;
        }
        const url = URL.createObjectURL(this.props.localStream);
        return (
            <div id="SpeakerUi">
                <h2><span>ON AIR</span></h2>
                <Video
                    muted={true}
                    src={url}
                    className="camera"
                />
            </div>
        );
    }
}

export default SpeakerUi;