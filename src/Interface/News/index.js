import React from 'react';
import PropTypes from 'prop-types';

import articles from './Articles';
import ArticleLoader from './ArticleLoader';

import './News.css';

class News extends React.PureComponent {
  static propTypes = {
    topAnchor: PropTypes.string.isRequired,
  };

  state = {
    page: 0,
  };

  get numArticles() {
    return Object.keys(articles).length;
  }
  get articlesPerPage() {
    return 5;
  }
  get pages() {
    return Math.ceil(this.numArticles / this.articlesPerPage);
  }
  get hasOlder() {
    return this.state.page < (this.pages - 1);
  }
  get hasNewer() {
    return this.state.page > 0;
  }

  constructor() {
    super();
    this.handleOlderClick = this.handleOlderClick.bind(this);
    this.handleNewerClick = this.handleNewerClick.bind(this);
  }

  handleOlderClick() {
    this.setState(state => ({
      page: Math.min(this.pages - 1, state.page + 1),
    }));
    this.scrollToTop();
  }
  handleNewerClick() {
    this.setState(state => ({
      page: Math.max(0, state.page - 1),
    }));
    this.scrollToTop();
  }
  scrollToTop() {
    const elem = document.getElementById(this.props.topAnchor);
    if (!elem) {
      console.error('Missing anchor element to scroll to:', this.props.topAnchor);
      return;
    }
    window.scrollTo(0, window.scrollY + elem.getBoundingClientRect().top);
  }

  render() {
    const indexStart = this.state.page * this.articlesPerPage;
    const indexEnd = indexStart + this.articlesPerPage;

    return (
      <div className="news">
        {Object.values(articles)
          .sort((a, b) => b.localeCompare(a))
          .filter((_, index) => index >= indexStart && index < indexEnd)
          .map(fileName => (
            <ArticleLoader
              key={fileName}
              fileName={fileName}
            >
              {({ article, showLoader }) => showLoader ? <div className="spinner" style={{ fontSize: 5 }} /> : article}
            </ArticleLoader>
          ))}

        <div className="row">
          <div className="col-xs-6">
            {this.hasOlder && (
              <a role="button" onClick={this.handleOlderClick} style={{ fontSize: '1.3em' }}>
                &lt; Older
              </a>
            )}
          </div>
          <div className="col-xs-6 text-right">
            {this.hasNewer && (
              <a role="button" onClick={this.handleNewerClick} style={{ fontSize: '1.3em' }}>
                Newer &gt;
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default News;
