import React from 'react';
import PropTypes from 'prop-types';
import AnimateHeight from 'react-animate-height';

import './Expandable.scss';

// This component can't be turned into a functional component until the Rule component (src/parser/shared/modules/features/Checklist/Rule.js) is refactored. That component uses the method `expand()` from the Expandable class component to expand it from outside.

class Expandable extends React.PureComponent {
  static propTypes = {
    header: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
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
  expand() {
    this.setState({
      expanded: true,
    });
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
