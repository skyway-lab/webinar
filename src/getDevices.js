import CONST from './Const';

// requires
// this.props.update
// this props alerts

function getDevices() {
    navigator.mediaDevices.enumerateDevices().then(devices => {
        this.props.update([{ op: 'replace', path: '/devices', value: devices }]);
    }).catch(err => {
        console.error(err);
    });
}

export default getDevices;
