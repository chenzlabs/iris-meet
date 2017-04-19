import React from 'react'
import PropTypes from 'prop-types'
import './main-video.css'

const MainVideo = ({children}) => (
  <div className="main-video">
    {children}
  </div>
);

MainVideo.propTypes = {
  children: PropTypes.array.isRequired
}

export default MainVideo
