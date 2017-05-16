import React, { Component } from 'react';
import Video from './Video';
import SelectDevices from './SelectDevices';
import CONST from './Const';

class LocalVideo extends Component {
    render() {
        if (!this.props.localStream) {
            return false;
        }
        let title;
        let className;
        let selectDevices;
        if (this.props.mode === CONST.ROLE_SPEAKER) {
            title = (
                <h2><span>ON AIR</span></h2>
            );
            const hasScreenStream = !!(this.props.screenStream);
            const doesScreenStreamUsed = this.props.localStream === this.props.screenStream;
            if (hasScreenStream && doesScreenStreamUsed) {
                className = 'screen';
            } else {
                className = 'camera';
            }
            selectDevices = (
                <SelectDevices
                    alerts={this.props.alerts}
                    room={this.props.room}
                    update={this.props.update}
                    localStream={this.props.localStream}
                    cameraStream={this.props.cameraStream}
                    screenStream={this.props.screenStream}
                    screenShare={this.props.screenShare}
                    devices={this.props.devices}
                    videoInId={this.props.videoInId}
                    audioInId={this.props.audioInId}
                    audioOutId={this.props.audioOutId}
                />
            );
        }
        const url = URL.createObjectURL(this.props.localStream);
        return (
            <div id="LocalVideo">
                {title}
                <Video
                    muted={true}
                    src={url}
                    className={className}
                />
                {selectDevices}
            </div>
        );
    }
}

export default LocalVideo;
