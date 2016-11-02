import React, { Component } from 'react';
import CONST from './Const';
import './Answer.css';

export default class Answer extends Component {
    _onClick (event) {
        const remotePeerId = this.props.remotePeerId;
        const newStatus = event.target.value;
        let talkingPeer = this.props.talkingPeer;
        let waitingPeers = this.props.waitingPeers;
        switch (newStatus) {
            case CONST.QA_STATUS_DO_NOTHING:
                talkingPeer = null;
                waitingPeers = {remove: remotePeerId};
                break;
            case CONST.QA_STATUS_TALKING:
                if (talkingPeer) {
                    waitingPeers = {remove: talkingPeer};
                }
                talkingPeer = remotePeerId;
                break;
            default:
                break;
        }
        this.props.room.send({ talkingPeer });
        this.props.update({ talkingPeer, waitingPeers });
    }
    render () {
        const remotePeerId = this.props.remotePeerId;
        const waitingPeers = this.props.waitingPeers;
        const talkingPeer = this.props.talkingPeer;
        const isOpponentTalking = talkingPeer === remotePeerId;
        const isOpponentWaiting = waitingPeers && waitingPeers.includes(remotePeerId);
        let className;
        let message;
        let newStatus;
        let label;
        if (isOpponentTalking) {
            className = 'disconnect';
            message = 'Questioning';
            newStatus = CONST.QA_STATUS_DO_NOTHING;
            label = 'Finish';
        } else if (isOpponentWaiting) {
            className = 'accept';
            message = 'Asking a question';
            newStatus = CONST.QA_STATUS_TALKING;
            label = 'Answer';
        } else {
            className = 'videooff';
            message = 'Just watching';
        }
        let button;
        if (newStatus && label) {
            button = (
                <div className="button-wrapper">
                    <button onClick={this._onClick.bind(this)} value={newStatus}>{label}</button>
                </div>
            );
        }
        return (
            <div className={'answers answers-' + className}>
                <div className="answers-message">
                    {message}
                </div>
                {button}
            </div>
        );
    }
}
