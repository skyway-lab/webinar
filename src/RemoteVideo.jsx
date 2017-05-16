import React, { Component } from 'react';
import Video from './Video';
import CONST from './Const';

class RemoteVideo extends Component {
    render() {
        const stream = this.props.stream;
        const url = URL.createObjectURL(stream);
        switch (this.props.opponent) {
            case CONST.ROLE_SPEAKER:
                let isSpeaker = stream.peerId === CONST.SPEAKER_PEER_ID;
                if (!isSpeaker) {
                    return false;
                }
                clearTimeout(this.props.timerNoSpeaker);
                break;
            case CONST.ROLE_AUDIENCE:
                break;
            case CONST.ROLE_QUESTIONER:
                let isQuestioner = stream.peerId === this.props.talkingPeer;
                if (!isQuestioner) {
                    return false;
                }
                break;
            default:
                return false;
        }
        let className;
        switch (this.props.speakerStreamKind) {
            case CONST.STREAM_KIND_CAMERA:
                className = 'camera';
                break;
            case CONST.STREAM_KIND_SCREEN:
                className = 'screen';
                break;
            default:
                break;
        }
        return (
            <div className="remote-video">
                <Video
                    muted={false}
                    className={className}
                    src={url}
                />
            </div>
        );
    }
}

export default RemoteVideo;