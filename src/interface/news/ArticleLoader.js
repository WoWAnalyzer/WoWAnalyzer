import React from 'react';
import PropTypes from 'prop-types';

import retryingPromise from 'common/retryingPromise';

class ArticleLoader extends React.PureComponent {
  static propTypes = {
    fileName: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired,
  };
  state = {
    article: null,
    showLoader: true,
  };

  constructor(props) {
    super(props);
    this.load(props.fileName);
    setTimeout(() => {
      this.setState(state => ({
        showLoader: !state.article,
      }));
    }, 1000);
  }

  load(fileName) {
    return retryingPromise(() => import(/* webpackChunkName: "articles/[request]" */ `articles/${fileName}/index.js`)
      .then(exports => exports.default)
      .then(article => {
        this.setState({
          article,
          showLoader: false,
        });
      }));
  }

  render() {
    return this.props.children({
      article: this.state.article,
      showLoader: this.state.showLoader,
    });
  }
}

export default ArticleLoader;
