import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRoute, Link, Router, Route, hashHistory } from 'react-router';
import App from './App';
import SelectMode from './SelectMode';
import AudienceUi from './AudienceUi';
import SpeakerUi from './SpeakerUi';
import './index.css';

ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={SelectMode} />
            <Route path=":roomName" component={AudienceUi} />
            <Route path=":roomName/speaker" component={SpeakerUi} />
        </Route>
    </Router>,
    document.getElementById('root')
);
