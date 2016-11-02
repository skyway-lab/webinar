import React, { Component } from 'react';
import CONST from './Const';
import './SelectMode.css';

class SelectMode extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick(event) {
        const mode = event.target.value;
        this.props.update({ mode });
    }
    render() {
        return (
            <div id="SelectMode">
                <h1>SkyWay Webinar</h1>
                <div className="button-container">
                    <button value={CONST.ROLE_SPEAKER} onClick={this.onClick}>Speaker</button>
                    <button value={CONST.ROLE_AUDIENCE} onClick={this.onClick}>Audience</button>
                </div>
            </div>
        );
    }
}

export default SelectMode;
