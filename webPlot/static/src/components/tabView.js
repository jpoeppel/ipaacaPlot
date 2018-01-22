import React, { PureComponent } from 'react';

import classNames from 'classnames';

export default class TabView extends PureComponent {

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
    
        const { children: groups } = this.props;
        const { openedGroup } = this.state;
        
        
        return (
            <div className="tabs_container">
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
            </div>
        )
    }


}