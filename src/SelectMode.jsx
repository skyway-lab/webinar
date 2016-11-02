import React, { Component } from 'react';
import CONST from './Const';
import './SelectMode.css';

class SelectMode extends Component {
    _onClick (event) {
        const mode = event.target.value;
        this.props.update({ mode });
    }
    render () {
        if (!this.props.mode) {
            return (
                <div id="SelectMode">
                    <h1>SkyWay Webinar</h1>
                    <div className="button-container">
                        <button value={CONST.ROLE_SPEAKER} onClick={this._onClick.bind(this)}>Speaker</button>
                        <button value={CONST.ROLE_AUDIENCE} onClick={this._onClick.bind(this)}>Audience</button>
                    </div>
                </div>
            );
        } else {
            return false;
        }
    }
}

export default SelectMode;
