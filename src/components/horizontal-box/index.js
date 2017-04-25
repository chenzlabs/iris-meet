import React from 'react'
import PropTypes from 'prop-types'
import './horizontal-box.css'

const HorizontalBoxComponent = ({children, onClick}) => {
  var vr = true;
  if (!vr) {
    return (
      <div className="horizontal-box" onClick={onClick}>
        {children}
      </div>
    );
  }

  // Find the video (if any) in the children we've been asked to display
  var video;
  var el = children;
  if (el) {
    // iris has video track with containers
    if (el.props.video && el.props.video.track && el.props.video.track.containers) {
      video = el.props.video.track.containers[0];
    } else
    // maybe the child was passed a video element
    if (el.props.video && el.props.video.id) {
      video = el.props.video;
    } else
    // maybe the child was passed an image element
    if (el.props.image && el.props.image.id) {
      video = el.props.image;
    } else
    // maybe the child was passed an element id
    if (el.props.id) {
      video = {id: el.props.id};
    } else {
    }
  }

  if (!video) {
    // no video?  show sky color
    return (<a-plane class="horizontal-box clickable" position="0 0 -1.8" color="#3CF" onClick={onClick}>{children}</a-plane>);
  } else {
    // show video as sky, or plane
    var videoSelector = video ? '#' + video.id : '';
    var videoEl = document.getElementById(video.id);
    if (videoEl && videoEl.poster) {
      videoSelector = videoEl.poster;
    }
    // if (threeSixty) { return (<a-sky class=".horizontal-box" rotation="0 -90 0" src={videoSelector}>{children}</a-sky>); }
    return (<a-plane class="horizontal-box clickable" position="0 0 -1.8" color="#FFF" src={videoSelector} onClick={onClick}>{children}</a-plane>);
  }
}

HorizontalBoxComponent.propTypes = {
  children: PropTypes.element.isRequired,
  onClick: PropTypes.func.isRequired
}

export default HorizontalBoxComponent
