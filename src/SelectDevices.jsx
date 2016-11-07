import React, { Component } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Glyphicon, DropdownButton, Dropdown, MenuItem } from 'react-bootstrap';
import CONST from './Const';
import './SelectDevices.css';
import './CustomIcons.css';

class Config extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick(event) {
        const localStream = this.props.localStream;
        const cameraStream = this.props.cameraStream;
        const screenStream = this.props.screenStream;
        const room = this.props.room;

        const isCameraClicked = event.currentTarget.value === CONST.STREAM_KIND_CAMERA;
        const isCameraUsed = localStream === cameraStream;

        if (isCameraClicked) {
            if (isCameraUsed) {
                // it will be never executed.
                return;
            }
            localStream.getTracks().forEach(track => {
                track.stop();
            });
            return;
        }

        const isScreenUsed = screenStream === cameraStream;
        if (isScreenUsed) {
            return;
        }

        const screenShare = this.props.screenShare || new SkyWay.ScreenShare({debug: true});
        if (!this.props.screenShare) {
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
            room.send({streamKind: CONST.STREAM_KIND_CAMERA});
            this.props.update([{ op: 'replace', path: '/localStream', value: cameraStream }]);
        }
        stopScreenShare = stopScreenShare.bind(this);

        function startScreenShareFirst() {
            screenShare.startScreenShare({
                FrameRate: 5
            }, successScreenShare, failScreenShare, stopScreenShare);
        }
        startScreenShareFirst = startScreenShareFirst.bind(this);

        function startScreenShare() {
            screenShare.startScreenShare({
                FrameRate: 5
            }, () => {}, () => {}, () => {});
        }
        startScreenShare = startScreenShare.bind(this);

        function installExtension() {
            chrome.webstore.install('', () => {
                console.log('succeeded to install extension');
            }, ev => {
                console.error('[error in installing extension]', ev);
            });

            window.addEventListener('message', function(ev) {
                if(ev.data.type === "ScreenShareInjected") {
                    console.log('screen share extension is injected, get ready to use');
                    startScreenShareFirst();
                }
            }, false);
        }


        if (screenShare.isEnabledExtension()) {
            if (!this.props.screenShare) {
                startScreenShareFirst();
            } else {
                startScreenShare();
            }
        } else {
            installExtension();
        }
    }
    render() {
        const localStream = this.props.localStream;
        const cameraStream = this.props.cameraStream;
        const screenStream = this.props.screenStream;
        function menuItemFunc(kind) {
            return function menuItem(deviceInfo) {
                if (deviceInfo.kind !== kind) {
                    return false;
                }
                return (
                    <MenuItem
                        value={deviceInfo.deviceId}
                        onClick={this.onClick}
                    >{deviceInfo.label}</MenuItem>
                );
            }
        }
        return (
            <div id="Config">
                <ButtonToolbar>
                    <ButtonGroup>
                        <Dropdown>
                            <Dropdown.Toggle>
                                <Glyphicon glyph="facetime-video" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {this.props.devices.map(menuItemFunc('videoinput').bind(this))}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Button
                            title="Screen"
                            value={CONST.STREAM_KIND_SCREEN}
                            onClick={this.onClick}
                            disabled={localStream === screenStream}
                        ><span className="icon icon-display" />
                        </Button>
                    </ButtonGroup>
                    <Dropdown>
                        <Dropdown.Toggle>
                            <span className="icon icon-microphone" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {this.props.devices.map(menuItemFunc('audioinput').bind(this))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown>
                        <Dropdown.Toggle>
                            <Glyphicon glyph="volume-up" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {this.props.devices.map(menuItemFunc('audiooutput').bind(this))}
                        </Dropdown.Menu>
                    </Dropdown>
                </ButtonToolbar>
            </div>
        );
    }
}

export default Config;
