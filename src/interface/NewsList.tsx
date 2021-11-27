import articles from 'articles';
import Contributor from 'interface/ContributorButton';
import { ReactComponent as Logo } from 'interface/images/logo.svg';
import NewsArticleLoader from 'interface/NewsArticleLoader';
import ReadableListing from 'interface/ReadableListing';
import SpecIcon from 'interface/SpecIcon';
import mergeAllChangelogs, { ChangeLogItem } from 'mergeAllChangelogs';
import { useState, useCallback } from 'react';
import 'interface/NewsPage.scss';

type ArticleItem = { article: string; date: Date };

interface Props {
  topAnchor: string;
}

const CHANGE_LOG_ENTRIES = mergeAllChangelogs();

const ARTICLE_ITEMS: ArticleItem[] = Object.values(articles)
  .sort((a, b) => b.localeCompare(a))
  .map((articleName) => {
    const uglyDateExtracter = articleName.split('-');
    return {
      article: articleName,
      date: new Date(
        Number(uglyDateExtracter[0]),
        Number(uglyDateExtracter[1]) - 1,
        Number(uglyDateExtracter[2]),
      ),
    };
  });

const ENTRIES_PER_PAGE = 50;
const NUM_PAGES = Math.ceil(
  (Object.keys(articles).length + CHANGE_LOG_ENTRIES.length) / ENTRIES_PER_PAGE,
);
const ALL_ENTRIES: Array<ArticleItem | ChangeLogItem> = [
  ...CHANGE_LOG_ENTRIES,
  ...ARTICLE_ITEMS,
].sort((a, b) => Number(b.date) - Number(a.date));

const hasOlder = (page: number) => page < NUM_PAGES - 1;
const hasNewer = (page: number) => page > 0;

const NewsList = ({ topAnchor }: Props) => {
  const [page, setPage] = useState(0);

  const scrollToTop = useCallback(() => {
    const elem = document.getElementById(topAnchor);
    if (!elem) {
      console.error('Missing anchor element to scroll to:', topAnchor);
      return;
    }
    window.scrollTo(0, window.scrollY + elem.getBoundingClientRect().top);
  }, [topAnchor]);

  const handleOlderClick = useCallback(() => {
    setPage(Math.min(NUM_PAGES - 1, page + 1));
    scrollToTop();
  }, [page, scrollToTop]);

  const handleNewerClick = useCallback(() => {
    setPage(page - 1);
    scrollToTop();
  }, [page, scrollToTop]);

  const indexStart = page * ENTRIES_PER_PAGE;
  const indexEnd = indexStart + ENTRIES_PER_PAGE;
  const entries = ALL_ENTRIES.filter((_, index) => index >= indexStart && index < indexEnd);

  return (
    <div className="news">
      {entries.map((item, index) => {
        if (Object.prototype.hasOwnProperty.call(item, 'article')) {
          item = item as ArticleItem;
          return (
            <NewsArticleLoader
              key={item.article}
              fileName={item.article}
              loader={<div className="spinner" style={{ fontSize: 5 }} />}
            />
          );
        } else {
          item = item as ChangeLogItem;
          return (
            <div key={index} className="panel changelog-entry">
              <div className="panel-heading">
                <small>
                  {!item.spec ? (
                    <>
                      <Logo /> WoWAnalyzer
                    </>
                  ) : (
                    <>
                      <SpecIcon spec={item.spec} /> {item.spec.specName} {item.spec.className}
                    </>
                  )}{' '}
                  updated at {item.date.toLocaleDateString()} by{' '}
                  <ReadableListing>
                    {item.contributors.map((contributor) => (
                      <Contributor key={contributor.nickname} {...contributor} />
                    ))}
                  </ReadableListing>
                </small>
              </div>
              <div className="panel-body pad">{item.changes}</div>
            </div>
          );
        }
      })}

      <div className="row">
        <div className="col-xs-6">
          {hasOlder(page) && (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a role="button" onClick={handleOlderClick} style={{ fontSize: '1.3em' }}>
              &lt; Older
            </a>
          )}
        </div>
        <div className="col-xs-6 text-right">
          {hasNewer(page) && (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a role="button" onClick={handleNewerClick} style={{ fontSize: '1.3em' }}>
              Newer &gt;
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsList;
