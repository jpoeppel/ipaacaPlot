import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CollapsibleCard from './collapsibleCard';

import classNames from 'classnames'


export default class ChartControls extends Component {


    constructor(props) {
        super(props)

        this.state = {
            openedGroup: props.group || 'Base',
        }
    }
    
    
    handleGroupToggle = groupName => {
        this.setState({ openedGroup: groupName })
    }
    
    render() {
    
        const { children: groups, title } = this.props;
        const { openedGroup } = this.state;
        
        
        return (
            <CollapsibleCard title={title} expandedByDefault={false}>
                <div className="tabs__menu">
                    {groups.map(group => {
                        return (
                            <div
                                key={group.props.name}
                                className={classNames('no-select tabs__menu__item', {
                                    '_is-active': openedGroup === group.props.name,
                                })}
                                onClick={() => {
                                    this.handleGroupToggle(group.props.name)
                                }}
                            >
                                {group.props.name}
                            </div>
                        )
                    })}
                </div>
                {groups.map(group => {
                    return (
                        <div
                            key={group.props.name}
                            style={{
                                display: openedGroup === group.props.name ? 'block' : 'none',
                            }}
                        >
                            {group.props.children}
                        </div>
                    )
                })}
            </CollapsibleCard>
        )
    }
    
}


ChartControls.propTypes = {
    group: PropTypes.string
}