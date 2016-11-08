import getCameraStream from './getCameraStream';
import connectToSkyWay from './connectToSkyWay';
import joinRoom from './joinRoom';

// requires this.props.update, roomName, remoteStream, mode, talkingPeer

function webinar(myPeerId, width, height, frameRate, isMuted) {
    const _joinRoom = joinRoom.bind(this);
    connectToSkyWay.bind(this)(myPeerId, () => {
        const isFinishedGetCameraStream = !!(this.props.localStream);
        if (!isFinishedGetCameraStream) {
            return;
        }
        _joinRoom();
    });
    getCameraStream.bind(this)(width, height, frameRate, isMuted, () => {
        const isFinishedConnectToSkyWay = !!(this.props.peer);
        if (!isFinishedConnectToSkyWay) {
            return;
        }
        _joinRoom();
    });
}

export default webinar;