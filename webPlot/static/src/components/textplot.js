import React, { PureComponent } from 'react';


export default class Text extends PureComponent {

    render() {
        
        const { data } = this.props;
        
        var style = {overflow: "auto"};
        console.log("Render text data: ", data);
     
        
        return (
                <div style={style}>
                    <pre>
                        {JSON.stringify(data)}
                    </pre>
                </div>
               )
    }
    
}

Text.displayName = 'Text';