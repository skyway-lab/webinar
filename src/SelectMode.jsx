import React, { Component } from 'react';
import { IndexRoute, Link, Router, Route, browserHistory } from 'react-router';
import { Button, Grid, Row, Col } from 'react-bootstrap';
import CONST from './Const';
import './SelectMode.css';

class SelectMode extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }
    onChange(event) {
        this.props.update([{ op: 'replace', path: '/roomName', value: event.target.value}]);
    }
    render() {
        console.info('SelectMode', this.props.params);
        const regex = new RegExp('^[\\w\\-]{1,' + CONST.ROOM_NAME_MAX_LENGTH + '}$');
        const isRoomNameValid = regex.test(this.props.roomName);
        console.info(this.props.roomName);
        console.info(isRoomNameValid);
        const className = isRoomNameValid ? null : 'warn';
        const disabled = !isRoomNameValid;
        return (
            <div id="SelectMode">
                <Grid>
                    <Row>
                        <Col xs={12} sm={8} smOffset={2} md={6} mdOffset={3}>
                            <h1>SkyWay Webinar</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={8} smOffset={2} md={6} mdOffset={3}>
                            <div className={'input-wrapper ' + className}>
                                <input
                                    type="text"
                                    onChange={this.onChange}
                                    placeholder="Webinar's name"
                                    value={this.props.roomName}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={8} smOffset={2} md={6} mdOffset={3}>
                            <Link to={`/${this.props.roomName}/speaker`} disabled={disabled}>Speaker</Link>
                            <Link to={`/${this.props.roomName}`} disabled={disabled}>Audience</Link>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export default SelectMode;
