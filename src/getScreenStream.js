import CONST from './Const';

// require
// this.props.screenShare
// this.props.update
// this.props.localStream
// this.props.cameraStream
// this.props.screenStream

function getScreenStream(frameRate) {
    const localStream = this.props.localStream;
    const cameraStream = this.props.cameraStream;
    const screenStream = this.props.screenStream;
    const room = this.props.room;

    const isFirstTime = !this.props.screenShare;

    const screenShare = this.props.screenShare || new SkyWay.ScreenShare({debug: true});

    if (isFirstTime) {
        this.props.update([{ op: 'replace', path: '/screenShare', value: screenShare }]);
    }

    function successScreenShare (screenStream) {
        room.replaceStream(screenStream);
        room.send({streamKind: CONST.STREAM_KIND_SCREEN});
        this.props.update([
            { op: 'replace', path: '/localStream', value: screenStream },
            { op: 'replace', path: '/screenStream', value: screenStream }
        ]);
    }
    successScreenShare = successScreenShare.bind(this);

    function failScreenShare (err) {
        console.error('[error in starting screen share]', err);
    }
    failScreenShare = failScreenShare.bind(this);

    function stopScreenShare () {
        room.replaceStream(cameraStream);
        room.send({ streamKind: CONST.STREAM_KIND_CAMERA });
        this.props.update([{ op: 'replace', path: '/localStream', value: cameraStream }]);
    }
    stopScreenShare = stopScreenShare.bind(this);

    function installExtension() {
        chrome.webstore.install('', () => {
            console.log('succeeded to install extension');
        }, ev => {
            console.error('[error in installing extension]', ev);
        });

        window.addEventListener('message', function(ev) {
            if(ev.data.type === "ScreenShareInjected") {
                console.log('screen share extension is injected, get ready to use');
                screenShare.startScreenShare({
                    FrameRate: frameRate
                }, successScreenShare, failScreenShare, stopScreenShare);
            }
        }, false);
    }

    if (screenShare.isEnabledExtension()) {
        if (isFirstTime) {
            screenShare.startScreenShare({
                FrameRate: frameRate
            }, successScreenShare, failScreenShare, stopScreenShare);
        } else {
            screenShare.startScreenShare({
                FrameRate: frameRate
            }, () => {}, () => {}, () => {});
        }
    } else {
        installExtension();
    }
}

export default getScreenStream;