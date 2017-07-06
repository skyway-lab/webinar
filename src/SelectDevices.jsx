import React, { Component } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Glyphicon, DropdownButton, Dropdown, MenuItem } from 'react-bootstrap';
import CONST from './Const';
import './SelectDevices.css';
import getCameraStream from './getCameraStream';
import './CustomIcons.css';

class SelectDevices extends Component {
    constructor(props) {
        super(props);
        this.onSelect = this.onSelect.bind(this);
    }

    onSelect(eventKey, event) {
        const [kind, id] = eventKey;

        switch (kind) {
            case 'videoinput':
                this.props.update([{op: 'replace', path: '/videoInId', value: id}]);
                getCameraStream.bind(this)(CONST.SPEAKER_CAMERA_WIDTH, CONST.SPEAKER_CAMERA_HEIGHT, CONST.SPEAKER_CAMERA_FRAME_RATE, (stream) => {
                    this.props.room.replaceStream(stream);
                }, id, undefined);

                return;
            case 'audioinput':
                this.props.update([{op: 'replace', path: '/audioInId', value: id}]);
                getCameraStream.bind(this)(CONST.SPEAKER_CAMERA_WIDTH, CONST.SPEAKER_CAMERA_HEIGHT, CONST.SPEAKER_CAMERA_FRAME_RATE, (stream) => {
                    this.props.room.replaceStream(stream);
                }, undefined, id);
                return;
        }
    }

    render() {
        function menuItemFunc(kind) {
            return function menuItem(device) {
                if (device.kind !== kind) {
                    return false;
                }
                let icon;
                let isUsed;
                switch (kind) {
                    case 'videoinput':
                        icon = <Glyphicon glyph="facetime-video"/>;
                        isUsed = this.props.videoInId === device.deviceId;
                        break;
                    case 'audioinput':
                        icon = <span className="icon icon-microphone"/>;
                        isUsed = this.props.audioInId === device.deviceId;
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
                                    <Glyphicon glyph="ok"/>
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
                            <Glyphicon glyph="facetime-video"/>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {this.props.devices ? this.props.devices.map(menuItemFunc('videoinput').bind(this)) : null}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown id="microphone">
                        <Dropdown.Toggle>
                            <span className="icon icon-microphone"/>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {this.props.devices ? this.props.devices.map(menuItemFunc('audioinput').bind(this)) : null}
                        </Dropdown.Menu>
                    </Dropdown>
                </ButtonGroup>
            </div>
        );
    }
}
export default SelectDevices;
