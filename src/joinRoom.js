import CONST from './Const';
import roomDataHandler from './roomDataHandler';

// requires
// this.props.roomName
// this.props.update
// this.props.remoteStreams
// this.props.mode
// this.props.talkingPeer
// this.props.mode
// this.props.waitingPeers
// this.props.peer
// this.props.talkingStatus
// this.props.localStream
// this.props.update

function joinRoom() {
    const localStream = this.props.localStream;
    const roomName = this.props.roomName;
    const room = this.props.peer.joinRoom(roomName, { mode: 'sfu', stream: localStream });
    this.props.update([{ op: 'replace', path: '/room', value: room }]);
    room.on('stream', _remoteStream => {
        console.log('room.on(\'stream\')');
        this.props.update([{ op: 'add', path: '/remoteStreams/-', value: _remoteStream }]);
    });
    room.on('removeStream', _remoteStream => {
        console.log('room.on(\'removeStream\')');
        const index = this.props.remoteStreams.indexOf(_remoteStream);
        if (index !== -1) {
            this.props.update([{ op: 'remove', path: '/remoteStreams/' + index }]);
        }
    });
    room.on('close', () => {
        console.log('room.on(\'close\')');
    });
    room.on('peerJoin', id => {
        console.log('room.on(\'peerJoin\')');
        if (this.props.mode === CONST.ROLE_SPEAKER) {
            room.send({ talkingPeer: this.props.talkingPeer });
        }
    });
    room.on('peerLeave', id => {
        console.log('room.on(\'peerLeave\'): ', id);
        const doesSpeakerExit
            = id === CONST.SPEAKER_PEER_ID
            && this.props.mode === CONST.ROLE_AUDIENCE;
        if (doesSpeakerExit) {
            this.props.update([ { op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_NO_SPEAKER} ]);
        }
    });
    room.on('data', roomDataHandler.bind(this));
    room.on('log', logs => {console.log(logs)});
    room.getLog();
    // skyway.js seems to close beforehand.
    /*
     window.addEventListener('beforeunload', () => {
     room.close();
     console.log('window.on(\'beforeunload\')');
     }, false);
     */
}

export default joinRoom;