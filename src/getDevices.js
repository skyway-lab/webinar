import CONST from './Const';

// requires
// this.props.update
// this props alerts

function getDevices() {
    navigator.mediaDevices.enumerateDevices().then(devices => {
        this.props.update([{ op: 'replace', path: '/devices', value: devices }]);
        console.info('videoInId', this.props.videoInId, ', audioInId: ', this.props.audioInId, ', audioOutId: ', this.props.audioOutId);
        if (!this.props.videoInId) {
            const videoInId = devices.find(device => device.kind === 'videoinput').deviceId;
            this.props.update([{ op: 'replace', path: '/videoInId', value: videoInId }]);
        }
        if (!this.props.audioInId) {
            const audioInId = devices.find(device => device.kind === 'audioinput').deviceId;
            this.props.update([{ op: 'replace', path: '/audioInId', value: audioInId }]);
        }
        if (!this.props.videoOutId) {
            const audioOutId = devices.find(device => device.kind === 'audiooutput').deviceId;
            this.props.update([{ op: 'replace', path: '/audioOutId', value: audioOutId }]);
        }
    }).catch(err => {
        console.error(err);
    });
}

export default getDevices;
