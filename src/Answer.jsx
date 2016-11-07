import React, { Component } from 'react';
import CONST from './Const';
import './Answer.css';

export default class Answer extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick(event) {
        const remotePeerId = this.props.remotePeerId;
        const newStatus = event.target.value;
        let talkingPeer = this.props.talkingPeer;
        let waitingPeers = this.props.waitingPeers;
        let patches = [];
        switch (newStatus) {
            case CONST.QA_STATUS_DO_NOTHING:
                talkingPeer = null;
                patches.push({ op: 'replace', path: '/talkingPeer', value: null });
                const index = waitingPeers.indexOf(remotePeerId);
                if (index !== -1) {
                    patches.push({ op: 'remove', path: '/waitingPeers/' + index });
                }
                break;
            case CONST.QA_STATUS_TALKING:
                if (talkingPeer) {
                    const index = waitingPeers.indexOf(talkingPeer);
                    if (index !== -1) {
                        patches.push({ op: 'remove', path: '/waitingPeers/' + index });
                    }
                }
                patches.push({ op: 'replace', path: '/talkingPeer', value: remotePeerId });
                talkingPeer = remotePeerId;
                break;
            default:
                break;
        }
        this.props.room.send({ talkingPeer });
        if (patches.length > 0) {
            this.props.update(patches);
        }
    }
    render() {
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
                    <button onClick={this.onClick} value={newStatus}>{label}</button>
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
