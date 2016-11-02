import React, { Component } from 'react';
import { Button, ButtonGroup, Glyphicon } from 'react-bootstrap';
import CONST from './Const';
import './Config.css';

class Config extends Component {
    _onClick (event) {
        if (event.currentTarget.value === CONST.STREAM_KIND_CAMERA) {
            if (this.props.localStream === this.props.cameraStream) {
                return;
            }
            this.props.localStream.getTracks().forEach(track => {
                track.stop();
            });
            return;
        }

        if (this.props.screenStream === this.props.cameraStream) {
            return;
        }

        const screenShare = this.props.screenShare || new SkyWay.ScreenShare({debug: true});
        if (!this.props.screenShare) {
            this.props.update({ screenShare });
        }

        function successScreenShare (stream) {
            console.log('successed screenshare');
            this.props.room.replaceStream(stream);
            this.props.room.send({streamKind: CONST.STREAM_KIND_SCREEN});
            this.props.update({
                localStream: stream,
                screenStream: stream
            });
        }

        function failScreenShare (err) {
            console.error('[error in starting screen share]', err);
        }

        function stopScreenShare () {
            console.log('stop screen share');
            this.props.room.replaceStream(this.props.cameraStream);
            this.props.room.send({streamKind: CONST.STREAM_KIND_CAMERA});
            this.props.update({ localStream: this.props.cameraStream });
        }

        function startScreenShareFirst() {
            screenShare.startScreenShare({
                FrameRate: 5
            }, successScreenShare.bind(this), failScreenShare.bind(this), stopScreenShare.bind(this));
        }

        function startScreenShare() {
            screenShare.startScreenShare({
                FrameRate: 5
            }, () => {}, () => {}, () => {});
        }

        function installExtension() {
            chrome.webstore.install('', () => {
                console.log('succeeded to install extension');
            }, ev => {
                console.error('[error in installing extension]', ev);
            });

            window.addEventListener('message', function(ev) {
                if(ev.data.type === "ScreenShareInjected") {
                    console.log('screen share extension is injected, get ready to use');
                    startScreenShareFirst.bind(this)();
                }
            }, false);
        }


        if (screenShare.isEnabledExtension()) {
            if (!this.props.screenShare) {
                startScreenShareFirst.bind(this)();
            } else {
                startScreenShare.bind(this)();
            }
        } else {
            installExtension();
        }
    }
    render () {
        if (!this.props.localStream || this.props.localStream === this.props.cameraStream) {
            return (
                <div id="Config">
                    <ButtonGroup>
                        <Button title="Camera" value={CONST.STREAM_KIND_CAMERA} disabled><Glyphicon glyph="facetime-video" /></Button>
                        <Button title="Screen" value={CONST.STREAM_KIND_SCREEN} onClick={this._onClick.bind(this)}><Glyphicon glyph="list-alt" /></Button>
                    </ButtonGroup>
                </div>
            );
        }
        return (
            <div id="Config">
                <ButtonGroup>
                    <Button title="Camera" value={CONST.STREAM_KIND_CAMERA} onClick={this._onClick.bind(this)}><Glyphicon glyph="facetime-video" /></Button>
                    <Button title="Screen" value={CONST.STREAM_KIND_SCREEN} disabled><Glyphicon glyph="list-alt" /></Button>
                </ButtonGroup>
            </div>
        );
    }
}

export default Config;
