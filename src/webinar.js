import CONST from './Const';

function webinar(myPeerId, width, height, frameRate, isMuted) {
    let peer;

    function _showLocalVideo(__width, __height, __frameRate, __isMuted) {
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
            .then(cameraStream => {
                const index = this.props.alerts.indexOf(CONST.ALERT_KIND_GUM);
                if (index !== -1) {
                    this.props.update([{ op: 'remove', path: '/alerts/' + index }]);
                }
                clearTimeout(timerAlertGUM);
                if (isMuted) {
                    cameraStream.getAudioTracks().forEach(track => {
                        track.enabled = false;
                    });
                    cameraStream.getVideoTracks().forEach(track => {
                        track.enabled = false;
                    });
                }
                this.props.update([
                    { op: 'replace', path: '/localStream', value: cameraStream },
                    { op: 'replace', path: '/cameraStream', value: cameraStream }
                ]);
                _showRemoteVideo.bind(this)(cameraStream);
            }).catch(err => {
            console.error(err);
            this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
        });
    }
    _showLocalVideo = _showLocalVideo.bind(this);

    function _showRemoteVideo(_localStream) {
        const roomName = this.props.roomName;
        const room = peer.joinRoom(roomName, { mode: 'sfu', stream: _localStream });
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
            console.log(id);
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
        room.on('data', msg => {
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
                        const willDisconnect = (msg.data.talkingPeer === null) || (msg.data.talkingPeer !== this.props.myPeerId);
                        const willTalk = (msg.data.talkingPeer === this.props.myPeerId);
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
        });
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
    _showRemoteVideo = _showRemoteVideo.bind(this);

    function _connectToSkyWay(_myPeerId, _width, _height, _frameRate, _isMuted) {
        if (_myPeerId) {
            peer = new Peer(_myPeerId, {
                key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837'
            });
        } else {
            peer = new Peer({
                key: 'a84196a8-cf9a-4c17-a7e9-ecf4946ce837'
            });
        }
        peer.on('open', () => {
            _showLocalVideo.bind(this)(_width, _height, _frameRate, _isMuted);
            this.props.update([{ op: 'replace', path: '/myPeerId', value: peer.id }]);
        });
        peer.on('error', err => {
            console.error(err.message);
            if (err.message === 'You do not have permission to send to this room') {
                this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_ROOM_PERMISSION }]);
            }
        });
    }
    _connectToSkyWay = _connectToSkyWay.bind(this);

    _connectToSkyWay(myPeerId, width, height, frameRate, isMuted);
}

export default webinar;