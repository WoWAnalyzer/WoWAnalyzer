import React from 'react';

import RegularArticle from 'Main/News/RegularArticle';

export const title = "A note about unlisted logs";

export default (
  <RegularArticle title={title} published="2017-01-31">
    Because Warcraft Logs offers no way to access private logs through the API, your logs must either be unlisted or public if you want to analyze them. If your guild has private logs you will have to <a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing logs to the <i>unlisted</i> privacy option instead.<br /><br />

    Do note that due to a restrictive API request limit we have to aggressively cache all API requests we send to Warcraft Logs. This means that once you run a log through the analyzer, the (secret) link for that log will continue to be accessible even if you change the original log (back) to the private privacy option on Warcraft Logs. Only the fights that you accessed will remain cached indefinitely.<br /><br />

    We will never share links to unlisted or private (analyzed) logs, nor include them recognizably in any public lists.
  </RegularArticle>
);
