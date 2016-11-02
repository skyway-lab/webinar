import CONST from './Const';

export default function webinar(myPeerId, width, height, frameRate, isMuted) {
    let peer;
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
            this.props.update({ myPeerId: peer.id });
        });
        peer.on('error', err => {
            console.error(err.message);
            if (err.message === 'You do not have permission to send to this room') {
                this.props.update({ alerts: { add: CONST.ALERT_KIND_ROOM_PERMISSION } });
            }
        });
    }
    function _showLocalVideo(__width, __height, __frameRate, __isMuted) {
        const videoConstraints = {
            width: __width,
            height: __height,
            frameRate: __frameRate,
            facingMode: 'user'
        };
        const timer = setTimeout(() => {
            this.props.update({ alerts: { add: CONST.ALERT_KIND_GUM } });
        }, 2000);
        navigator.mediaDevices.getUserMedia({audio: true, video: videoConstraints})
            .then(stream => {
                this.props.update({ alerts: { remove: CONST.ALERT_KIND_GUM } });
                clearTimeout(timer);
                if (isMuted) {
                    stream.getAudioTracks().forEach(track => {
                        track.enabled = false;
                    });
                    stream.getVideoTracks().forEach(track => {
                        track.enabled = false;
                    });
                }
                this.props.update({
                    localStream: stream,
                    cameraStream: stream
                });
                _showRemoteVideo.bind(this)(stream);
            }).catch(err => {
            console.error(err);
            this.props.update({ alerts: { add: CONST.ALERT_KIND_GUM } });
        });
    }
    function _showRemoteVideo(_stream) {
        const roomName = this.props.roomName;
        const room = peer.joinRoom(roomName, { mode: 'sfu', stream: _stream });
        this.props.update({ room });
        room.on('stream', _stream => {
            console.log('room.on(\'stream\')');
            this.props.update({ remoteStreams: { add: _stream } });
        });
        room.on('removeStream', _stream => {
            console.log('room.on(\'removeStream\')');
            this.props.update({ remoteStreams: { remove: _stream } });
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
        });
        room.on('data', msg => {
            console.log('room.on(\'data\'): ', msg);
            let state = {};
            switch (this.props.mode) {
                case CONST.ROLE_SPEAKER:
                    if (msg.data.talkingStatus === CONST.QA_STATUS_WAITING) {
                        state.waitingPeers = {add: msg.src};
                    } else if (msg.data.talkingStatus === CONST.QA_STATUS_DO_NOTHING) {
                        state.waitingPeers = {remove: msg.src};
                        state.talkingPeer = undefined;
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
                        state.speakerStreamKind = msg.data.streamKind;
                        break;
                    }
                    if (msg.data.hasOwnProperty('talkingPeer')) {
                        const isTalking = (this.props.talkingStatus === CONST.QA_STATUS_TALKING);
                        const willDisconnect = (msg.data.talkingPeer === null) || (msg.data.talkingPeer !== this.props.myPeerId);
                        const willTalk = (msg.data.talkingPeer === this.props.myPeerId);
                        if (isTalking && willDisconnect) {
                            state.talkingStatus = CONST.QA_STATUS_DO_NOTHING;
                            this.props.localStream.getAudioTracks().forEach(track => {
                                track.enabled = false;
                            });
                            this.props.localStream.getVideoTracks().forEach(track => {
                                track.enabled = false;
                            });
                        }
                        if (!isTalking && willTalk) {
                            state.talkingStatus = CONST.QA_STATUS_TALKING;
                            this.props.localStream.getAudioTracks().forEach(track => {
                                track.enabled = true;
                            });
                        }
                        state.talkingPeer = msg.data.talkingPeer;
                    }
                    break;
                default:
                    break;
            }
            if (Object.keys(state).length > 0) {
                this.props.update(state);
            }
        });
        room.on('log', logs => {console.info(logs)});
        room.getLog();
        // skyway.js seems to close beforehand.
        /*
         window.addEventListener('beforeunload', () => {
         room.close();
         console.log('window.on(\'beforeunload\')');
         }, false);
         */
    }
    _connectToSkyWay.bind(this)(myPeerId, width, height, frameRate, isMuted);
}