import React from 'react'
import PropTypes from 'prop-types'
import './main-video.css'

const MainVideo = ({children, threeSixty}) => {
    if (!threeSixty) { return (<div className="main-video">{children}</div>); }

    var video = document.querySelector('.main-video video');
    if (video) {
      // show video as sky
      var videoSelector = video ? '#' + video.id : '';
      return (<div className="main-video">
        <a-scene embedded style={threeSixty ? {zIndex: 1} : {zIndex: 0}}>
          <a-sky rotation="0 -90 0" src={videoSelector}></a-sky>
        </a-scene>
          {children}</div>);
    } else {
      // no video?  show sky color
      return (<div className="main-video">
        <a-scene embedded style={threeSixty ? {zIndex: 1} : {zIndex: 0}}>
          <a-sky rotation="0 -90 0" color="#3CF"></a-sky>
        </a-scene>
          {children}</div>);
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
