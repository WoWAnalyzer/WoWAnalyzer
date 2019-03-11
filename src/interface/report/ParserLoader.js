import React from 'react';
import PropTypes from 'prop-types';

class ParserLoader extends React.PureComponent {
  static propTypes = {
    config: PropTypes.shape({
      parser: PropTypes.func.isRequired,
    }).isRequired,
    children: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      parserClass: null,
    };
    this.load();
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (prevProps.config !== this.props.config) {
      this.setState({
        isLoading: true,
        parserClass: null,
      });
      this.load();
    }
  }

  async load() {
    const parserClass = await this.loadParser();
    this.setState({
      isLoading: false,
      parserClass,
    });
  }
  async loadParser() {
    return this.props.config.parser();
  }

  render() {
    return this.props.children(this.state.isLoading, this.state.parserClass);
  }
}

export default ParserLoader;
