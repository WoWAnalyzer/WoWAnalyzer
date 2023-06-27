
import DocumentTitle from 'interface/DocumentTitle';
import { constructURL } from 'interface/ReportSelecter';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Search = () => {
  const location = useLocation();
  const query =
    decodeURIComponent(location.pathname.replace('/search/', '')) +
    decodeURIComponent(location.hash);
  const [valid, setValid] = useState<boolean>(false);
  const navigate = useNavigate();
  useEffect(() => {
    const constructedURL = constructURL(query);
    if (constructedURL) {
      navigate(constructedURL, { replace: true }); //attempt redirect to report analysis if one was found
    } else {
      setValid(false);
    }
  }, [navigate, setValid, query]);

  return (
    <div className="container">
      <DocumentTitle title="Search" />
      <h1>
        <>Report Search</>
      </h1>
      {valid ? (
        <>
          <>Searching for</>{' '}
        </>
      ) : (
        <>
          <>Invalid search parameter:</>{' '}
        </>
      )}
      <b>{query}</b>
      <br />
      <br />
      <>
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
      </>
      <br />
      <Link to="/">
        <>Go back home</>
      </Link>
    </div>
  );
};

export default Search;
