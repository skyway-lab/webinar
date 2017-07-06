import React, { Component } from 'react';
import { IndexRoute, Link, Router, Route, browserHistory } from 'react-router';
import { Button, Grid, Row, Col } from 'react-bootstrap';
import CONST from './const';
import './SelectMode.css';

class SelectMode extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        const index = Math.floor(Math.random() * CONST.ROOM_NAME_WORDS.length);
        this.placeholder = CONST.ROOM_NAME_WORDS[index] + '-webinar';
    }
    onChange(event) {
        this.props.update([{ op: 'replace', path: '/roomName', value: event.target.value }]);
    }
    render() {
        const regex = new RegExp('^[\\w\\-]{1,' + CONST.ROOM_NAME_MAX_LENGTH + '}$');
        const isRoomNameValid = regex.test(this.props.roomName);
        const className = isRoomNameValid ? null : 'warn';
        const disabled = !isRoomNameValid;
        return (
            <div id="SelectMode">
                <Grid>
                    <Row className="show-grid">
                        <Col xs={12} sm={10} smOffset={1} md={8} mdOffset={2} lg={6} lgOffset={3}>
                            <h1>SkyWay Webinar</h1>
                        </Col>
                    </Row>
                    <Row className="show-grid">
                        <Col xs={12} sm={10} smOffset={1} md={8} mdOffset={2} lg={6} lgOffset={3}>
                            <div className={'input-wrapper ' + className}>
                                <input
                                    type="text"
                                    onChange={this.onChange}
                                    placeholder={"Webinar's name e.g. " + this.placeholder}
                                    value={this.props.roomName}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row className="show-grid">
                        <Col xs={12} sm={10} smOffset={1} md={8} mdOffset={2} lg={6} lgOffset={3}>
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
