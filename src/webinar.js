import CONST from './Const';

let _peer;

function _getUserMedia(__width, __height, __frameRate, __isAudience) {
    const videoConstraints = {
        width: __width,
        height: __height,
        frameRate: __frameRate,
        facingMode: 'user'
    };
    const timerAlertGUM = setTimeout(() => {
        this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
    }, CONST.TIMEOUT_MILLISECONDS_ALERT_GUM);
    navigator.mediaDevices.getUserMedia({audio: true, video: videoConstraints})
        .then(localStream => {
            const index = this.props.alerts.indexOf(CONST.ALERT_KIND_GUM);
            if (index !== -1) {
                this.props.update([{ op: 'remove', path: '/alerts/' + index }]);
            }
            clearTimeout(timerAlertGUM);
            this.props.update([
                { op: 'replace', path: '/localStream', value: localStream }
            ]);

            /* work around start */
            if (__isAudience) {
                localStream.getAudioTracks().forEach(track => {
                    track.enabled = false;
                });
                localStream.getVideoTracks().forEach(track => {
                    track.enabled = false;
                });
            }
            /* work around end */

            _joinRoom(localStream, false);
        }).catch(err => {
        console.error(err);
        this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
    });
}

function _joinRoom(_localStream, _isAudience) {
    /* work around start */
    //if (_isAudience) {
    //    _localStream = new window.MediaStream();
    //}
    /* work around end */

    const roomName = this.props.roomName;
    const room = _peer.joinRoom(roomName, { mode: 'sfu', stream: _localStream });
    this.props.update([{ op: 'replace', path: '/room', value: room }]);
    room.on('stream', _remoteStream => {
        console.log('room.on(\'stream\'): ', _remoteStream.peerId);
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
        console.log('room.on(\'peerJoin\'): ', id);
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
    // skyway.js seems to close beforehand.
    /*
     window.addEventListener('beforeunload', () => {
     room.close();
     console.log('window.on(\'beforeunload\')');
     }, false);
     */
}

function _connectToSkyWay(_myPeerId, _width, _height, _frameRate) {
    if (_myPeerId) {
        _peer = new Peer(_myPeerId, {
            key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837'
        });
    } else {
        _peer = new Peer({
            key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837'
        });
    }
    _peer.on('open', () => {
        console.log('peer.on(\'open\'): ', _peer.id);
        this.props.update([{ op: 'replace', path: '/myPeerId', value: _peer.id }]);
        if (_myPeerId) {
            _getUserMedia(_width, _height, _frameRate);
        } else {
            /* work around start */
            //_joinRoom(null, true);
            _getUserMedia(160, 120, 1, true);
            /* work around end */
        }
    });
    _peer.on('error', err => {
        console.error(err.message);
        if (err.message === 'You do not have permission to send to this room') {
            this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_ROOM_PERMISSION }]);
        }
        if (err.message === 'PeerId "speaker" is already in use. Choose a different peerId and try again.') {
            this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_PEERID_IN_USE }]);
        }
    });
}

function send(myPeerId, width, height, frameRate) {
    _getUserMedia = _getUserMedia.bind(this);
    _joinRoom = _joinRoom.bind(this);
    _connectToSkyWay = _connectToSkyWay.bind(this);
    _connectToSkyWay(myPeerId, width, height, frameRate);
}

function receive() {
    _getUserMedia = _getUserMedia.bind(this);
    _joinRoom = _joinRoom.bind(this);
    _connectToSkyWay = _connectToSkyWay.bind(this);
    _connectToSkyWay();
}

export default {send, receive};