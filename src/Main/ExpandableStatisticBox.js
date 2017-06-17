import React from 'react';
import PropTypes from 'prop-types';

class ExpandableStatisticBox extends React.PureComponent {
  static propTypes = {
    icon: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
    label: PropTypes.node.isRequired,
    expanded: PropTypes.bool,
    children: PropTypes.node,
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
    });
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      icon: newProps.icon,
      value: newProps.value,
      label: newProps.label,
      expanded: newProps.showCastEvents,
    });
  }

  toggleExpansion() {
    this.setState({
      expanded: !this.state.showCastEvents,
    });
  }

  render() {
    return (
      <div className="panel statistic-box expandable">
        <div className="panel-body">
          <div className="row">
            <div className="col-xs-3">
              {this.state.icon}
            </div>
            <div className="col-xs-9">
              <div className="statistic-value text-right">
                {this.state.value}
              </div>
              <div className="statistic-label text-right">
                {this.state.label}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xs-12">
              { this.state.showCastEvents && (
              <div className="statistic-expansion">
                { this.props.children }
              </div> )}
            </div>
          </div>

          <div className="statistic-expansion-button-holster">
              <button onClick={this.toggleExpansion} className="btn btn-primary">
                { !this.state.showCastEvents && <span className="glyphicon glyphicon-chevron-down"></span> }
                { this.state.showCastEvents && <span className="glyphicon glyphicon-chevron-up"></span> }
              </button>
            </div>
        </div>
      </div>
    );
  }
}

export default ExpandableStatisticBox;
