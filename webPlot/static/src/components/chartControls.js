import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import CollapsibleCard from './collapsibleCard';

import TabView from "./tabView";



export default class ChartControls extends PureComponent {

    render() {
    
        const { children: groups, title, group } = this.props;
        
        
        return (
            <CollapsibleCard title={title} expandedByDefault={false}>
                <TabView group={group}>
                    {groups}
                </TabView>
            </CollapsibleCard>
        )
    }
    
}


ChartControls.propTypes = {
    group: PropTypes.string
}