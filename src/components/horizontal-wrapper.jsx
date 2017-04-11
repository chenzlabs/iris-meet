import React from 'react';
import MainFooter from './main-footer';

export default function HorizontalWrapper(props) {
  return (
      <div id = "footer">
        <div className={props.isHidden ? "horizontal-wrapper videoBarHide" : "horizontal-wrapper videoBarShow"}>
            {props.children}
        </div>
      </div>
  );
}

//export default MainFooter(HorizontalWrapper)


/*
import React from 'react';
import MainFooter from './main-footer';

class HorizontalWrapper extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.isHidden ? "horizontal-wrapper videoBarHide" : "horizontal-wrapper videoBarShow"}>
                {this.props.children}
            </div>
        );
    }
}

export default MainFooter(HorizontalWrapper)
*/
