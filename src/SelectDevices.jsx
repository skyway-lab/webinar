import React, { Component } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Glyphicon, DropdownButton, Dropdown, MenuItem } from 'react-bootstrap';
import CONST from './Const';
import getCameraStream from './getCameraStream';
import getScreenStream from './getScreenStream';
import './SelectDevices.css';
import './CustomIcons.css';

class SelectDevices extends Component {
    constructor(props) {
        super(props);
        this.onSelect = this.onSelect.bind(this);
    }
    onSelect(eventKey, event) {
        const localStream = this.props.localStream;
        const cameraStream = this.props.cameraStream;
        const screenStream = this.props.screenStream;
        const isScreenUsed = localStream === screenStream;
        const isCameraUsed = localStream === cameraStream;

        const [kind, id] = eventKey;

        switch (kind) {
            case 'videoinput':
                let isScreenClicked = id === CONST.STREAM_KIND_SCREEN;

                if (isScreenClicked) {
                    // camera -> screen
                    getScreenStream.bind(this)(CONST.SPEAKER_SCREEN_FRAME_RATE);
                    return;
                }

                if (isScreenUsed) {
                    // screen -> camera
                    localStream.getTracks().forEach(track => {
                        track.stop();
                    });
                }

                // screen -> camera
                // camera -> camera
                this.props.update([{ op: 'replace', path: '/videoInId', value: id }]);
                getCameraStream.bind(this)(CONST.SPEAKER_CAMERA_WIDTH, CONST.SPEAKER_CAMERA_HEIGHT, CONST.SPEAKER_CAMERA_FRAME_RATE, false, (cameraStream) => {
                    this.props.room.replaceStream(cameraStream);
                }, id, undefined);

                return;
            case 'audioinput':
                this.props.update([{ op: 'replace', path: '/audioInId', value: id }]);

                if (isScreenUsed) {
                    // TBD
                    return;
                }

                getCameraStream.bind(this)(CONST.SPEAKER_CAMERA_WIDTH, CONST.SPEAKER_CAMERA_HEIGHT, CONST.SPEAKER_CAMERA_FRAME_RATE, false, () => {
                    this.props.room.replaceStream(cameraStream);
                }, undefined, id);
                return;
            case 'audiooutput':
                this.props.update([{ op: 'replace', path: '/audioOutId', value: id }]);
                break;
        }
    }
    render() {
        const localStream = this.props.localStream;
        const cameraStream = this.props.cameraStream;
        const screenStream = this.props.screenStream;
        const isScreenUsed = localStream === screenStream;
        const isCameraUsed = localStream === cameraStream;

        function menuItemFunc(kind) {
            return function menuItem(device) {
                if (device.kind !== kind) {
                    return false;
                }
                let icon;
                let isUsed;
                switch (kind) {
                    case 'videoinput':
                        icon = <Glyphicon glyph="facetime-video" />;
                        isUsed = isCameraUsed && this.props.videoInId === device.deviceId;
                        break;
                    case 'audioinput':
                        icon = <span className="icon icon-microphone" />;
                        isUsed = this.props.audioInId === device.deviceId;
                        break;
                    case 'audiooutput':
                        icon = <Glyphicon glyph="volume-up" />;
                        isUsed = this.props.audioOutId === device.deviceId;
                        break;
                    default:
                        break;
                }
                return (
                    <MenuItem
                        eventKey={[kind, device.deviceId]}
                        onSelect={this.onSelect}
                        disabled={isUsed}
                    >
                        {icon}
                        {device.label}
                        {(() => {
                            if (isUsed) {
                                return (
                                    <Glyphicon glyph="ok" />
                                );
                            }
                        })()}
                    </MenuItem>
                );
            }
        }
        return (
            <div id="SelectDevices">
                    <ButtonGroup>
                        <Dropdown id="camera">
                            <Dropdown.Toggle>
                                {(() => {
                                    if (isCameraUsed) {
                                        return (
                                            <Glyphicon glyph="facetime-video"/>
                                        );
                                    }
                                    return (
                                        <span className="icon icon-display" />
                                    );
                                })()}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {this.props.devices.map(menuItemFunc('videoinput').bind(this))}
                                <MenuItem
                                    eventKey={['videoinput', CONST.STREAM_KIND_SCREEN]}
                                    onSelect={this.onSelect}
                                    disabled={isScreenUsed}
                                >
                                    <span className="icon icon-display" />
                                    Screen Sharing
                                    {(() => {
                                        if (isScreenUsed) {
                                            return (
                                                <Glyphicon glyph="ok" />
                                            );
                                        }
                                    })()}
                                </MenuItem>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown id="microphone">
                            <Dropdown.Toggle>
                                <span className="icon icon-microphone" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {this.props.devices.map(menuItemFunc('audioinput').bind(this))}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown id="speaker">
                            <Dropdown.Toggle>
                                <Glyphicon glyph="volume-up" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {this.props.devices.map(menuItemFunc('audiooutput').bind(this))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </ButtonGroup>
            </div>
        );
    }
}

export default SelectDevices;
