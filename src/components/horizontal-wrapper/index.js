import React from 'react'
import PropTypes from 'prop-types'
import './horizontal-wrapper.css'

const HorizontalWrapper = ({isHidden, children}) => {
  var flattened = [];
  children.forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((el) => { flattened.push(el); });
    } else {
      flattened.push(child);
    }
  });
  return (
  <div id="footer">
    <div className={isHidden ? "horizontal-wrapper videoBarHide" : "horizontal-wrapper videoBarShow"}>
      {flattened}
    </div>
  </div>
  );
}

HorizontalWrapper.PropTypes = {
  isHidden: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired
}

export default HorizontalWrapper
