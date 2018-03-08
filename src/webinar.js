import CONST from './const';

function _newPeer(_this, _myPeerId) {
    return new Promise((resolve, reject) => {
        let _peer;
        if (_myPeerId) {
            _peer = new Peer(_myPeerId, {
                key: 'fcc1512f-d07a-402c-9e7a-5adf38909681'
            });
        } else {
            _peer = new Peer({
                key: 'fcc1512f-d07a-402c-9e7a-5adf38909681'
            });
        }
        _this.props.update([{ op: 'replace', path: '/myPeerId', value: _peer.id }]);
        _peer.on('open', () => {
             window.onbeforeunload = () => {
                 _peer.disconnect();
             };
            resolve([_this, _peer]);
        });
        _peer.on('error', err => {
            console.error(err.message);
            if (err.message === 'You do not have permission to send to this room') {
                _this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_ROOM_PERMISSION }]);
            }
            if (/^PeerId ".+" is already in use\. Choose a different peerId and try again\.$/.test(err.message)) {
                _this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_PEERID_IN_USE }]);
            }
            reject();
        });
    });
}

function _getStream(_this, _videoInId, _audioInId) {
    return new Promise((resolve, reject) => {
        const constraints = {
            video: {
                deviceId: _videoInId ? { exact: _videoInId } : undefined,
                width: CONST.SPEAKER_CAMERA_WIDTH,
                height: CONST.SPEAKER_CAMERA_HEIGHT,
                frameRate: CONST.SPEAKER_CAMERA_FRAME_RATE,
                facingMode: 'user'
            },
            audio: {
                deviceId: _audioInId ? { exact: _audioInId } : undefined,
            }
        };
        const timerAlertGUM = setTimeout(() => {
            _this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
        }, CONST.TIMEOUT_MILLISECONDS_ALERT_GUM);

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                const index = _this.props.alerts.indexOf(CONST.ALERT_KIND_GUM);
                if (index !== -1) {
                    _this.props.update([{ op: 'remove', path: '/alerts/' + index }]);
                }
                clearTimeout(timerAlertGUM);
                _this.props.update([
                    { op: 'replace', path: '/localStream', value: stream }
                ]);
                resolve([_this, stream]);
            })
            .catch(error => {
                console.error(error);
                _this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
                reject();
            });
    });
}

function _getDummyStream(_this) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.getContext("2d");
    const dummyStream = canvas.captureStream(1);
    return Promise.resolve([_this, dummyStream]);
}

function _getDevices(_this) {
    return new Promise((resolve, rejcet) => {
        navigator.mediaDevices.enumerateDevices()
            .then(_devices => {
                _this.props.update([{ op: 'replace', path: '/devices', value: _devices }]);
                if (!_this.props.videoInId) {
                    const videoInId = _devices.find(device => device.kind === 'videoinput').deviceId;
                    _this.props.update([{ op: 'replace', path: '/videoInId', value: videoInId }]);
                }
                if (!_this.props.audioInId) {
                    const audioInId = _devices.find(device => device.kind === 'audioinput').deviceId;
                    _this.props.update([{ op: 'replace', path: '/audioInId', value: audioInId }]);
                }
                resolve(_this);
            });
    });
}

function _joinRoom(_values) {
    const _this = _values[0][0];
    const _peer = _values[0][1];
    const _localStream = _values[1][1];
    const roomName = _this.props.roomName;
    const room = _peer.joinRoom(roomName, { mode: 'sfu', stream: _localStream });
    _this.props.update([{ op: 'replace', path: '/room', value: room }]);
    room.on('stream', _remoteStream => {
        let patch = [];
        const doesSpeakerJoin
            = _remoteStream.peerId === _this.props.params.roomName + '-' + CONST.SPEAKER_PEER_ID
            && _this.props.mode === CONST.ROLE_AUDIENCE;
        const index = _this.props.alerts.indexOf(CONST.ALERT_KIND_NO_SPEAKER);
        if (doesSpeakerJoin && index !== -1) {
            patch.push({ op: 'remove', path: '/alerts/' + index });
        }
        patch.push({ op: 'add', path: '/remoteStreams/-', value: _remoteStream });
        _this.props.update(patch);
    });
    room.on('removeStream', _remoteStream => {
        const index = _this.props.remoteStreams.indexOf(_remoteStream);
        if (index !== -1) {
            _this.props.update([{ op: 'remove', path: '/remoteStreams/' + index }]);
        }
    });
    room.on('peerLeave', id => {
        const doesSpeakerExit
            = id === _this.props.params.roomName + '-' + CONST.SPEAKER_PEER_ID
            && _this.props.mode === CONST.ROLE_AUDIENCE;
        if (doesSpeakerExit) {
            _this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_NO_SPEAKER}]);
        }
    });
}

function send(_myPeerId) {
    Promise.all([
        _newPeer(this, _myPeerId),
        _getStream(this),
        _getDevices(this)
    ]).then(_joinRoom);
}

function receive() {
    Promise.all([
        _newPeer(this),
        _getDummyStream(this)
    ]).then(_joinRoom);
}

function changeSource(_videoInId, _audioInId) {
    _getStream(this, _videoInId ? _videoInId : this.props.videoInId, _audioInId ? _audioInId : this.props.audioInId)
        .then(values => {
            const _this = values[0];
            const stream = values[1];
            _this.props.room.replaceStream(stream);
        });
}

export default {send, receive, changeSource};