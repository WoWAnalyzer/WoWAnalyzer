import React from 'react';
import PropTypes from 'prop-types';

import articles from 'articles';
import mergeAllChangelogs from 'mergeAllChangelogs';
import SpecIcon from 'common/SpecIcon';
import ReadableListing from 'interface/ReadableListing';
import Contributor from 'interface/ContributorButton';
import { ReactComponent as Logo } from 'interface/images/logo.svg';

import ArticleLoader from './ArticleLoader';
import './News.scss';

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
  get changelogEntries() {
    return mergeAllChangelogs();
  }
  get articlesPerPage() {
    return 50;
  }
  get pages() {
    return Math.ceil((this.numArticles + this.changelogEntries.length) / this.articlesPerPage);
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

    const pageArticles = Object.values(articles)
      .sort((a, b) => b.localeCompare(a))
      .filter((_, index) => index >= indexStart && index < indexEnd)
      .map(articleName => {
        const uglyDateExtracter = articleName.split('-');
        const date = new Date(uglyDateExtracter[0], uglyDateExtracter[1] - 1, uglyDateExtracter[2]);

        return {
          date,
          article: articleName,
        };
      });

    const entries = [...pageArticles, ...this.changelogEntries]
      .sort((a, b) => b.date - a.date)
      .filter((_, index) => index >= indexStart && index < indexEnd);


    return (
      <div className="news">
        {entries
          .map((item, index) => {
            if (item.article) {
              return (
                <ArticleLoader
                  key={item.article}
                  fileName={item.article}
                >
                  {({ article, showLoader }) => showLoader ? <div className="spinner" style={{ fontSize: 5 }} /> : article}
                </ArticleLoader>
              );
            } else {
              return (
                <div key={`${item.category}-${index}`} className="panel changelog-entry">
                  <div className="panel-heading">
                    <small>
                      {!item.spec ? (
                        <>
                          <Logo /> WoWAnalyzer
                        </>
                      ) : (
                        <>
                          <SpecIcon id={item.spec.id} /> {item.spec.specName} {item.spec.className}
                        </>
                      )} updated at {item.date.toLocaleDateString()} by <ReadableListing>
                        {item.contributors.map(contributor => <Contributor key={contributor.nickname} {...contributor} />)}
                      </ReadableListing>
                    </small>
                  </div>
                  <div className="panel-body pad">
                    {item.changes}
                  </div>
                </div>
              );
            }
          })}

        <div className="row">
          <div className="col-xs-6">
            {this.hasOlder && (
              <a role="button" onClick={this.handleOlderClick} style={{ fontSize: '1.3em' }}>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                &lt; Older
              </a>
            )}
          </div>
          <div className="col-xs-6 text-right">
            {this.hasNewer && (
              <a role="button" onClick={this.handleNewerClick} style={{ fontSize: '1.3em' }}>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
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
