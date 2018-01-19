import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames'


export default class Text extends PureComponent {


    constructor(props) {
        super(props);
    }
    
    render() {
        
        const { data } = this.props;
        
        var style = {overflow: "auto"};
        console.log("Render text data: ", data);
     
        
        return (
                <div style={style}>
                    {data}
                </div>
               )
    }
    
}

Text.displayName = 'Text';