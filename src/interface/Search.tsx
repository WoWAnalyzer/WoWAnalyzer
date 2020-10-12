import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/macro';
import { Link, useHistory } from 'react-router-dom';

import { constructURL } from 'interface/ReportSelecter';
import DocumentTitle from 'interface/DocumentTitle';

interface Props {
  query: string;
}

const Search = ({ query }: Props) => {
  const [valid, setValid] = useState<boolean>(false);
  const { replace } = useHistory();
  useEffect(() => {
    const constructedURL = constructURL(query);
    if (constructedURL) {
      replace(constructedURL); //attempt redirect to report analysis if one was found
    } else {
      setValid(false);
    }
  }, [replace, setValid, query]);

  return (
    <div className="container">
      <DocumentTitle title="Search" />
      <h1>Report Search</h1>
      {valid ? <>Searching for </> : <>Invalid search parameter: </>}
      <b>{query}</b>
      <br />
      <br />
      <Trans>
        Supported search terms:
        <br />
        <ul>
          <li>&lt;report code&gt;</li>
          <li>https://www.warcraftlogs.com/reports/&lt;report code&gt;</li>
          <li>https://www.warcraftlogs.com/character/&lt;region&gt;/&lt;realm&gt;/&lt;name&gt;</li>
          <li>
            https://worldofwarcraft.com/&lt;language-code&gt;/character/&lt;realm&gt;/&lt;name&gt;
          </li>
        </ul>
      </Trans>
      <br />
      <Link to="/">Go back home</Link>
    </div>
  );
};

export default Search;
