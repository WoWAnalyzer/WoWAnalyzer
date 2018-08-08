import React from 'react';
import PropTypes from 'prop-types';

import DropdownIcon from 'Interface/Icons/Dropdown';

import './Panel.css';

class Panel extends React.PureComponent {
  static propTypes = {
    tab: PropTypes.shape({
      title: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
    }).isRequired,
    defaultExpanded: PropTypes.bool,
  };
  static defaultProps = {
    defaultExpanded: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      expanded: props.defaultExpanded,
    };
    this.handleToggle = this.handleToggle.bind(this);
  }
  handleToggle() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { tab } = this.props;

    return (
      <div className={`panel results-panel expandable ${this.state.expanded ? 'expanded' : ''}`}>
        <div className="panel-heading meta" onClick={this.handleToggle}>
          <div className="flex">
            <div className="flex-sub chevron">
              <DropdownIcon />
            </div>
            <div className="flex-main title">
              {tab.title}
            </div>
          </div>
        </div>
        {this.state.expanded && (
          <div className="panel-body">
            {tab.render()}
          </div>
        )}
      </div>
    );
  }
}

export default Panel;
