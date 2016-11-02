import React, { Component } from 'react';
import RemoteVideo from './RemoteVideo';
import CONST from './Const';

class RemoteVideos extends Component {
    render() {
        let className;
        switch (this.props.opponent) {
            case CONST.ROLE_SPEAKER:
                className = 'speaker';
                break;
            case CONST.ROLE_AUDIENCE:
                className = 'audience';
                break;
            case CONST.ROLE_QUESTIONER:
                className = 'questioner';
                break;
            default:
                break;
        }
        let title;
        if (this.props.opponent === CONST.ROLE_AUDIENCE) {
            title = (
                <h2><span>Audience</span></h2>
            );
        }
        return (
            <div className={"remote-videos remote-videos-" + className}>
                {title}
                {this.props.remoteStreams.map(stream => (
                    <RemoteVideo
                        opponent={this.props.opponent}
                        localStream={this.props.localStream}
                        update={this.props.update}
                        talkingStatus={this.props.talkingStatus}
                        waitingPeers={this.props.waitingPeers}
                        talkingPeer={this.props.talkingPeer}
                        room={this.props.room}
                        speakerStreamKind={this.props.speakerStreamKind}
                        stream={stream}
                    />
                ))}
            </div>
        );
    }
}

export default RemoteVideos;