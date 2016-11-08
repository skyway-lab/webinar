import CONST from './Const';

// requires
// this.props.mode
// this.props.waitingPeers
// this.props.talkingPeer
// this.props.peer
// this.props.talkingStatus
// this.props.localStream
// this.props.update

function roomDataHandler(msg) {
    console.log('room.on(\'data\'): ', msg);
    let patches = [];
    switch (this.props.mode) {
        case CONST.ROLE_SPEAKER:
            if (msg.data.talkingStatus === CONST.QA_STATUS_WAITING) {
                patches.push({ op: 'add', path: '/waitingPeers/-', value: msg.src });
            } else if (msg.data.talkingStatus === CONST.QA_STATUS_DO_NOTHING) {
                const index = this.props.waitingPeers.indexOf(msg.src);
                if (index !== -1) {
                    patches.push({ op: 'remove', path: '/waitingPeers/' + index });
                }
                patches.push({ op: 'replace', path: '/talkingPeer', value: null });
            }
            break;
        case CONST.ROLE_AUDIENCE:
            if (msg.src !== CONST.SPEAKER_PEER_ID) {
                return;
            }
            if (this.props.talkingPeer === msg.data.talkingPeer) {
                return;
            }
            if (msg.data.streamKind) {
                patches.push({ op: 'replace', path: '/speakerStreamKind', value: msg.data.streamKind });
                break;
            }
            if (msg.data.hasOwnProperty('talkingPeer')) {
                const isTalking = (this.props.talkingStatus === CONST.QA_STATUS_TALKING);
                const willDisconnect = (msg.data.talkingPeer === null) || (msg.data.talkingPeer !== this.props.peer.id);
                const willTalk = (msg.data.talkingPeer === this.props.peer.id);
                if (isTalking && willDisconnect) {
                    patches.push({ op: 'replace', path: '/talkingStatus', value: CONST.QA_STATUS_DO_NOTHING });
                    this.props.localStream.getAudioTracks().forEach(track => {
                        track.enabled = false;
                    });
                    this.props.localStream.getVideoTracks().forEach(track => {
                        track.enabled = false;
                    });
                }
                if (!isTalking && willTalk) {
                    patches.push({ op: 'replace', path: '/talkingStatus', value: CONST.QA_STATUS_TALKING });
                    this.props.localStream.getAudioTracks().forEach(track => {
                        track.enabled = true;
                    });
                }
                patches.push({ op: 'replace', path: '/talkingPeer', value: msg.data.talkingPeer });
            }
            break;
        default:
            break;
    }
    if (patches.length > 0) {
        this.props.update(patches);
    }
}

export default roomDataHandler;