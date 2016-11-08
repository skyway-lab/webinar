import CONST from './Const';

// requires this.props.update

function connectToSkyWay(myPeerId, callback) {
    let peer;
    if (myPeerId) {
        peer = new Peer(myPeerId, {
            key: CONST.API_KEI
        });
    } else {
        peer = new Peer({
            key: CONST.API_KEI
        });
    }
    peer.on('open', () => {
        this.props.update([
            { op: 'replace', path: '/peer', value: peer },
            { op: 'replace', path: '/myPeerId', value: peer.id }
        ]);
        if (callback) {
            callback();
        }
    });
    peer.on('error', err => {
        console.error(err.message);
        if (err.message === 'You do not have permission to send to this room') {
            this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_ROOM_PERMISSION }]);
        }
        if (err.message === 'PeerId "speaker" is already in use. Choose a different peerId and try again.') {
            this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_PEERID_IN_USE }]);
        }
    });
}

export default connectToSkyWay;