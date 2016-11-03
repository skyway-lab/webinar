import React, { Component } from 'react';
import { IndexRoute, Link, Router, Route, browserHistory } from 'react-router';
import { Button, Grid, Row, Col } from 'react-bootstrap';
import CONST from './Const';
import './SelectMode.css';

class SelectMode extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick(event) {
        const mode = event.target.value;
        this.props.update([{ op: 'replace', path: '/mode', value: mode }]);
    }
    onChange(event) {
    }
    render() {
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
                            <input type="text" onChange={this.onChange} placeholder="Input Room Name" />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={8} smOffset={2} md={6} mdOffset={3}>
                            <button value={CONST.ROLE_SPEAKER} onClick={this.onClick}>Speaker</button>
                            <button value={CONST.ROLE_AUDIENCE} onClick={this.onClick}>Audience</button>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export default SelectMode;
