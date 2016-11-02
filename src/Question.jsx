import React, { Component } from 'react';
import CONST from './Const';

class Question extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick(event) {
        const newStatus = event.target.value;
        let state = {};
        switch (newStatus) {
            case CONST.QA_STATUS_DO_NOTHING:
                state.talkingStatus = CONST.QA_STATUS_DO_NOTHING;
                state.talkingPeer = null;
                this.props.room.send({ talkingStatus: CONST.QA_STATUS_DO_NOTHING });
                this.props.localStream.getAudioTracks().forEach(track => {
                    track.enabled = false;
                });
                this.props.localStream.getVideoTracks().forEach(track => {
                    track.enabled = false;
                });
                break;
            case CONST.QA_STATUS_WAITING:
                state.talkingStatus = CONST.QA_STATUS_WAITING;
                this.props.room.send({ talkingStatus: CONST.QA_STATUS_WAITING });
                this.props.localStream.getVideoTracks().forEach(track => {
                    track.enabled = true;
                });
                break;
            default:
                break;
        }
        if (Object.keys(state).length > 0) {
            this.props.update(state);
        }
    }
    render() {
        let className;
        let button;
        let newStatus;
        switch (this.props.talkingStatus) {
            case CONST.QA_STATUS_DO_NOTHING:
                className = 'call';
                button = 'Question';
                newStatus = CONST.QA_STATUS_WAITING;
                break;
            case CONST.QA_STATUS_WAITING:
                className = 'cancel';
                button = 'Cancel';
                newStatus = CONST.QA_STATUS_DO_NOTHING;
                break;
            case CONST.QA_STATUS_TALKING:
                className = 'disconnect';
                button = 'Finish';
                newStatus = CONST.QA_STATUS_DO_NOTHING;
                break;
            default:
                return false;
        }
        return (
            <div className={'button-wrapper button-wrapper-' + className}>
                <button onClick={this.onClick} value={newStatus}>{button}</button>
            </div>
        );
    }
}

export default Question;