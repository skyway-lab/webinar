import React, { Component } from 'react';
import { Button, Alert, Grid, Row, Col } from 'react-bootstrap';
import CONST from './Const';
import './Alerts.css';

export default class Alerts extends Component {
    constructor(props) {
        super(props);
        this.dismissAlert = this.dismissAlert.bind(this);
    }
    dismissAlert() {
        const index = this.props.alerts.indexOf(CONST.ALERT_KIND_UNSTABLE_SFU);
        if (index !== -1) {
            this.props.update([{ op: 'remove', path: '/alerts/' + index, value: CONST.ALERT_KIND_UNSTABLE_SFU }]);
        }
    }
    reload() {
        location.reload();
    }
    render () {
        let notSupportedWebRTC;
        if (this.props.alerts.includes(CONST.ALERT_KIND_NOT_SUPPORT_WEBRTC)) {
            notSupportedWebRTC = (
                <Alert bsStyle="danger">
                    SkyWay Webinar doesn't suport your browser because your browser doesn't support WebRTC.
                    Would you use <a href="https://www.google.co.jp/chrome/">Google Chrome</a>?
                </Alert>
            );
        }
        let unstableSFU;
        if (this.props.alerts.includes(CONST.ALERT_KIND_UNSTABLE_SFU)) {
            unstableSFU = (
                <Alert bsStyle="warning" onDismiss={this.dismissAlert}>
                    Currently, Firefox are unstable in using SKyWay Webinar and we are fixing problems.
                    So we recommend <a href="https://www.google.co.jp/chrome/">Google Chrome</a> now.
                </Alert>
            );
        }
        let gUM;
        if (this.props.alerts.includes(CONST.ALERT_KIND_GUM)) {
            gUM = (
                <Alert bsStyle="danger">
                    <p>
                        SkyWay Webinar use microphone and camera, even if you are just watching.
                        Anybody never see your audio and video unless you don't question.
                        Would you allow to use?
                    </p>
                    <p>
                        You have to reload this page if you deny onece.
                    </p>
                    <p>
                        <Button bsStyle="danger" onClick={this.reload}>Reload</Button>
                    </p>
                </Alert>
            );
        }
        let roomPermission;
        if (this.props.alerts.includes(CONST.ALERT_KIND_ROOM_PERMISSION)) {
            roomPermission = (
                <Alert bsStyle="danger">
                    <p>
                        An error has occured in SkyWay Room API.
                        This error sometimes happens because the API is still alpha version.
                        Could you reload the page?
                    </p>
                    <p>
                        <Button bsStyle="danger" onClick={this.reload}>Reload</Button>
                    </p>
                </Alert>
            );
        }
        if (notSupportedWebRTC || unstableSFU || gUM || roomPermission) {
            return (
                <div id="Alerts">
                    <Grid fluid={true}>
                        <Row>
                            <Col xs={12} sm={5} smOffset={7} md={4} mdOffset={8} lg={3} lgOffset={9}>
                                {notSupportedWebRTC}
                                {unstableSFU}
                                {gUM}
                                {roomPermission}
                            </Col>
                        </Row>
                    </Grid>
                </div>
            );
        }
        return (
            <div></div>
        );
    }
}
