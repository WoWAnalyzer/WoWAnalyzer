import React from 'react';
import PropTypes from 'prop-types';

import { select } from 'd3-selection';

class SvgWrappingText extends React.PureComponent {
  static propTypes = {
    children: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
  };

  elem = null;
  constructor() {
    super();
    this.elem = React.createRef();
  }

  componentDidMount() {
    this.wrap(this.elem.current, this.props.width);
  }

  // Wrap SVG text so long lines are condensed
  // Taken from http://bl.ocks.org/mbostock/7555321. Cleaned it up a little to meet our coding style.
  wrap(elem, width) {
    const text = select(elem);
    const words = text.text().split(/\s+/);
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.4; // ems
    const y = text.attr('y');
    const x = text.attr('x');
    const dy = parseFloat(text.attr('dy'));
    let tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

    // noinspection JSAssignmentUsedAsCondition
    words.forEach(word => {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        lineNumber += 1;
        tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', lineNumber * lineHeight + dy + 'em').text(word);
      }
    });
  }

  render() {
    return (
      <text {...this.props} ref={this.elem} />
    );
  }
}

export default SvgWrappingText;
