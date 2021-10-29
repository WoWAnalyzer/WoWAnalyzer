import { matchPath } from 'react-router-dom';

// Not sure this is the right place to define this, but for now it allows us these selectors anywhere in the code
export default (pathname: string) =>
  matchPath<{
    reportCode?: string;
    fightId?: string;
    player?: string;
    build?: string;
    resultTab?: string;
  }>(pathname, '/report/:reportCode?/:fightId?/:player?/:build?/:resultTab?');
