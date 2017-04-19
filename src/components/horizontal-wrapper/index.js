import React from 'react'
import PropTypes from 'prop-types'
import './horizontal-wrapper.css'

const HorizontalWrapper = ({isHidden, children}) => {
  var vr = true;
  if (!vr) {
    return (
      <div id="footer">
        <div className={isHidden ? "horizontal-wrapper videoBarHide" : "horizontal-wrapper videoBarShow"}>
          {children}
        </div>
      </div>
    );
  }

  // we want to emit an entity wrapper around each child
  var i=0, filteredChildren = children.filter(function(ch) { 
      return ch && ch.length; 
  }), len=filteredChildren.length, theta=30; 
  var wrappedChildren = filteredChildren.map(function(el) { 
      var rotation = "0 " + (theta*(i - (len-1)/2.0)) + " 0";
      i++;
      return (<a-entity scale="0.96 0.54 1" rotation={rotation}>{el}</a-entity>); });
  return (<a-entity class="horizontal-wrapper" position="0 0.6 0" visible={isHidden ? "false" : "true"}>{wrappedChildren}</a-entity>);
}

HorizontalWrapper.PropTypes = {
  isHidden: PropTypes.bool.isRequired,
  children: PropTypes.array.isRequired
}

export default HorizontalWrapper
