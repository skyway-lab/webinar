import React, { Component } from 'react';
import Video from './Video';
import CONST from './Const';

class RemoteVideos extends Component {
    constructor(props) {
        super(props);
        this.timerNoSpeaker = setTimeout(() => {
            this.props.update([ { op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_NO_SPEAKER} ]);
        }, CONST.TIMEOUT_MILLISECONDS_ALERT_NO_SPEAKER);
    }
    render() {
        const remoteVideo = this.props.remoteStreams.map(stream => {
            const url = URL.createObjectURL(stream);
            if (this.props.opponent !== CONST.ROLE_SPEAKER) {
                return false;
            }
            let isSpeaker = stream.peerId === CONST.SPEAKER_PEER_ID;
            if (!isSpeaker) {
                return false;
            }
            clearTimeout(this.timerNoSpeaker);
            return (
                <div className="remote-video">
                    <Video
                        muted={false}
                        className="camera"
                        src={url}
                    />
                </div>
            );
        });
        return (
            <div className="remote-videos remote-videos-speaker">
                { remoteVideo }
            </div>
        );
    }
}

export default RemoteVideos;