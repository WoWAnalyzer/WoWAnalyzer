import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import AnimateHeight from 'react-animate-height';

class Expandable extends React.PureComponent {
  static propTypes = {
    header: PropTypes.node.isRequired,
    children: PropTypes.func.isRequired,
    element: PropTypes.string,
    className: PropTypes.string,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleToggle() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }
  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  render() {
    const { header, children, element: Element, className } = this.props;

    return (
      <Element className={`expandable ${this.state.expanded ? 'expanded' : ''} ${className || ''}`}>
        <div className="meta" onClick={this.handleToggle}>
          {header}
        </div>
        <AnimateHeight className="details" height={this.state.expanded ? 'auto' : 0}>
          {children}
        </AnimateHeight>
      </Element>
    );
  }
}

export default Expandable;
