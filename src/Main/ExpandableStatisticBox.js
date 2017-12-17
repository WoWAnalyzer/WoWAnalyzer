import React from 'react';
import PropTypes from 'prop-types';

class ExpandableStatisticBox extends React.PureComponent {
  static propTypes = {
    icon: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
    label: PropTypes.node.isRequired,
    expanded: PropTypes.bool,
    children: PropTypes.node,
    tooltip: PropTypes.string,
  };

  constructor() {
    super();
    this.state = {
      expanded: true,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  componentWillMount() {
    this.setState({
      icon: this.props.icon,
      value: this.props.value,
      label: this.props.label,
      expanded: this.props.expanded,
      tooltip: this.props.tooltip,
    });
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      icon: newProps.icon,
      value: newProps.value,
      label: newProps.label,
      expanded: newProps.expanded,
      tooltip: newProps.tooltip,
    });
  }

  toggleExpansion() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" style={{ zIndex: 1 }}>
        <div className="panel statistic-box expandable">
          <div className="panel-body">
            <div className="flex">
              <div className="flex-sub">
                {this.state.icon}
              </div>
              <div className="flex-main" style={{ paddingLeft: 16 }}>
                <div className="value">
                  {this.state.value}
                </div>
                <div className="slabel">
                  {this.state.tooltip ? <dfn data-tip={this.state.tooltip}>{this.state.label}</dfn> : this.state.label}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-xs-12">
                {this.state.expanded && (
                  <div className="statistic-expansion">
                    { this.props.children }
                  </div>
                )}
              </div>
            </div>

            <div className="statistic-expansion-button-holster">
              <button onClick={this.toggleExpansion} className="btn btn-primary">
                {!this.state.expanded && <span className="glyphicon glyphicon-chevron-down" />}
                {this.state.expanded && <span className="glyphicon glyphicon-chevron-up" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ExpandableStatisticBox;
