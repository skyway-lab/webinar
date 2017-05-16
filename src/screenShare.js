class ScreenShare {
    constructor(options) {
        if (typeof options === "undefined") {
            options = null;
        }
        this._debug = false;
        if (options !== null && 'debug' in options) {
            this._debug = options.debug;
        }
    }
    startScreenShare(param, success, error, onEndedEvent, audioInId) {
        var _this = this;
        if (typeof onEndedEvent === "undefined") { onEndedEvent = null; }

        const _param = {};

        const _constraints = {
            video: {
                mediaSource: 'screen',
                width: param.Width ? param.Width : undefined,
                height: param.Height ? param.Height: undefined,
                frameRate: param.FrameRate ? param.FrameRate : undefined,
                TemporalLayeredScreencastConstraint: true
            },
            audio: {
                deviceId: audioInId ? { exact: audioInId } :undefined,
            }
        };

        if (!!navigator.mozGetUserMedia) {
            navigator.mediaDevices.getUserMedia(_constraints)
                .then(stream => {
                    success(stream)
                }).catch(err => {
                    console.error('screen share error: ', err);
                    this.props.update([{ op: 'add', path: '/alerts/-', value: CONST.ALERT_KIND_GUM }]);
            });
        } else if (!!navigator.webkitGetUserMedia) {
            // for Chrome
            window.addEventListener('message', function (event) {
                if (event.data.type != 'gotStreamId') {
                    return;
                }
                _constraints.video.mediaSourceId = event.data.streamid;
                navigator.mediaDevices.getUserMedia(_constraints)
                    .then(stream => {
                        console.log('Got a stream for screen share');
                        var streamTrack = stream.getVideoTracks();
                        streamTrack[0].onended = function (event) {
                            console.log('Stream ended event fired : ', JSON.stringify(event));
                            if (typeof (onEndedEvent) !== 'undefined' && onEndedEvent !== null) {
                                onEndedEvent();
                            }
                        };
                    success(stream);
                }).catch(err => {
                    console.error('screen share error: ', err);
                    error(err);
                });
            });
            window.postMessage({ type: "getStreamId" }, "*");
        }
    }
    stopScreenShare() {
        return false;
    }
    isEnabledExtension() {
        if (typeof (window.ScreenShareExtentionExists) === 'boolean' || (window.AdapterJS && AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.isPluginInstalled)) {
            this.logger('ScreenShare Extension available');
            return true;
        } else {
            this.logger('ScreenShare Extension not available');
            return false;
        }
    }
    logger(message) {
        if (this._debug) {
            console.log("SkyWay-ScreenShare: " + message);
        }
    }
}

export default ScreenShare;