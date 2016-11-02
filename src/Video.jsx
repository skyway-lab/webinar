import React from 'react';

class Video extends React.Component {
    render() {
        return (
            <video
                autoPlay
                muted={this.props.muted}
                src={this.props.src}
                className={this.props.className}
            />
        );
    }
}

export default Video;
