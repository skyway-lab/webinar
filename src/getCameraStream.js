import CONST from './Const';

// requires
// this.props.update
// this props alerts

function getCameraStream(width, height, frameRate, callback, videoInId = this.props.videoInId, audioInId = this.props.audioInId) {
    const constraints = {
        video: {
            deviceId: videoInId ? { exact: videoInId } :undefined,
            width,
            height,
            frameRate
        },
        audio: {
            deviceId: audioInId ? { exact: audioInId } :undefined,
        }
    };
    const timerAlertGUM = setTimeout(() => {
        this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
    }, CONST.TIMEOUT_MILLISECONDS_ALERT_GUM);
    console.info('constraints', constraints);
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            const index = this.props.alerts.indexOf(CONST.ALERT_KIND_GUM);
            if (index !== -1) {
                this.props.update([{ op: 'remove', path: '/alerts/' + index }]);
            }
            clearTimeout(timerAlertGUM);
            this.props.update([
                { op: 'replace', path: '/localStream', value: stream }
            ]);
            if (callback) {
                callback(stream);
            }
        }).catch(err => {
            console.error(err);
            this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
        });
}

export default getCameraStream;
