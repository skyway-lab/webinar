import React, { Component } from 'react';
import Video from './Video';
import SelectDevices from './SelectDevices';
import CONST from './const';
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
            webinar.send.bind(this)(this.props.params.roomName + '-' + CONST.SPEAKER_PEER_ID);
        }
        if (!this.props.localStream) {
            return false;
        }
        const viewers = this.props.remoteStreams.length;
        const unit = (viewers > 2) ? 'viewers' : 'viewer';
        const url = URL.createObjectURL(this.props.localStream);
        return (
            <div id="SpeakerUi">
                <h2><span>{viewers} {unit}</span></h2>
                <Video
                    muted={true}
                    src={url}
                    className="camera"
                />
                <SelectDevices
                    alerts={this.props.alerts}
                    room={this.props.room}
                    update={this.props.update}
                    localStream={this.props.localStream}
                    devices={this.props.devices}
                    videoInId={this.props.videoInId}
                    audioInId={this.props.audioInId}
                />
            </div>
        );
    }
}

export default SpeakerUi;