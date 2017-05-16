import React, { Component } from 'react';
import { IndexRoute, Link, Router, Route, browserHistory } from 'react-router';
import RemoteVideos from './RemoteVideos';
import CONST from './Const';
import webinar from './webinar';
import './AudienceUi.css';

class AudienceUi extends Component {
    constructor(props) {
        super(props);
        this.isWebinarStarted = false;
        this.props.update([
            { op: 'replace', path: '/mode', value: CONST.ROLE_AUDIENCE },
            { op: 'replace', path: '/roomName', value: this.props.params.roomName}
        ]);
    }
    render() {
        if (!this.isWebinarStarted) {
            this.isWebinarStarted = true;
            webinar.receive.bind(this)();
        }
        return (
            <div id="AudienceUi">
                <RemoteVideos
                    localStream={this.props.localStream}
                    remoteStreams={this.props.remoteStreams}
                    opponent={CONST.ROLE_SPEAKER}
                    update={this.props.update}
                    room={this.props.room}
                />
            </div>
        );
    }
}

export default AudienceUi;