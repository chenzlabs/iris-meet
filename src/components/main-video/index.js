import React from 'react'
import PropTypes from 'prop-types'
import './main-video.css'

const MainVideo = ({children, threeSixty}) => {
    var vr = true;
    if (!vr) {
      // TODO: put back the inline 360 view functionality, if we care
      return (<div className="main-video">{children}</div>);
    }

    // Find the video (if any) in the children we've been asked to display
    var video;
    children.forEach(function (el) {
      if (el && el.props.video && el.props.video.track && el.props.video.track.containers) { 
        video = el.props.video.track.containers[0]; 
      }
    });
    if (!video) {
      // no video?  show sky color
      return (
          <a-sky class=".main-video" rotation="0 -90 0" color="#3CF">
          {children}</a-sky>);
    } else {
      // show video as sky, or plane
      var videoSelector = video ? '#' + video.id : '';
      // experiment: try NOT showing the children again as they have duplicate IDs
      if (threeSixty) { return (<a-sky class=".main-video" rotation="0 -90 0" src={videoSelector}></a-sky>); }
      return (<a-plane class=".main-video" scale="4.8 2.7 1" position="0 1.6 -2" src={videoSelector}></a-plane>);
    }
};

MainVideo.propTypes = {
  children: PropTypes.array.isRequired,
  threeSixty: PropTypes.bool
}

MainVideo.defaultProps = {
  threeSixty: false
}

export default MainVideo
