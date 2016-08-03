import React from 'react';
import MainFooter from './main-footer';

class HorizontalWrapper extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <div className="horizontal-wrapper">
                {this.props.children}
            </div>
        );
    }
}

export default MainFooter(HorizontalWrapper)