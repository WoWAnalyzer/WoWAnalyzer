import React from 'react';
import { Trans } from '@lingui/macro';

import NewsIcon from 'interface/icons/Megaphone';

import NewsList from './List';

class News extends React.PureComponent {
  render() {
    return (
      <>
        <header>
          <div className="row">
            <div className="col-md-12">
              <h1 id="Announcements"><NewsIcon /> <Trans>Announcements</Trans></h1>
            </div>
          </div>
        </header>
        <main>
          <NewsList topAnchor="Announcements" />
        </main>
      </>
    );
  }
}

export default News;
