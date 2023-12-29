import Contributor from 'interface/ContributorButton';
import Logo from 'interface/images/logo.svg?react';
import ReadableListing from 'interface/ReadableListing';
import SpecIcon from 'interface/SpecIcon';
import mergeAllChangelogs, { ChangeLogItem } from 'mergeAllChangelogs';
import { useCallback, useState } from 'react';
import { useLingui } from '@lingui/react';

import './NewsList.scss';

interface Props {
  topAnchor: string;
}

const CHANGE_LOG_ENTRIES = mergeAllChangelogs();

const ENTRIES_PER_PAGE = 50;
const NUM_PAGES = Math.ceil(CHANGE_LOG_ENTRIES.length / ENTRIES_PER_PAGE);
const ALL_ENTRIES: Array<ChangeLogItem> = [...CHANGE_LOG_ENTRIES].sort(
  (a, b) => Number(b.date) - Number(a.date),
);

const hasOlder = (page: number) => page < NUM_PAGES - 1;
const hasNewer = (page: number) => page > 0;

const NewsList = ({ topAnchor }: Props) => {
  const [page, setPage] = useState(0);
  const { i18n } = useLingui();

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
      {entries.map((item, index) => (
        <div key={index} className="panel changelog-entry">
          <div className="panel-heading">
            <small>
              {!item.spec ? (
                <>
                  <Logo /> WoWAnalyzer
                </>
              ) : (
                <>
                  <SpecIcon spec={item.spec} />{' '}
                  {item.spec.specName ? i18n._(item.spec.specName) : undefined}{' '}
                  {i18n._(item.spec.className)}
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
      ))}

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
