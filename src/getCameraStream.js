import CONST from './Const';

// requires
// this.props.update
// this props alerts

function getCameraStream(width, height, frameRate, isMuted, callback, cameraId = this.props.cameraId, microphoneId = this.props.microphoneId) {
    const videoConstraints = {
        deviceId: cameraId ? { exact: cameraId } :undefined,
        width,
        height,
        frameRate
    };
    const audioConstraints = {
        deviceId: microphoneId ? { exact: microphoneId } :undefined,
    };
    const timerAlertGUM = setTimeout(() => {
        this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
    }, CONST.TIMEOUT_MILLISECONDS_ALERT_GUM);
    console.info('constraints', {audio: audioConstraints, video: videoConstraints});
    navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: videoConstraints })
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
            if (callback) {
                callback(cameraStream);
            }
        }).catch(err => {
        console.error(err);
        this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
    });
}

export default getCameraStream;
