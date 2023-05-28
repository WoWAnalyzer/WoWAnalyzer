import { matchPath } from 'react-router-dom';

export const getMatchWithReportCode = (pathname: string) =>
  matchPath('/report/:reportCode/*', pathname);

export const getMatchWithFightId = (pathname: string) =>
  matchPath('/report/:reportCode/:fightId/*', pathname);

export const getMatchWithPlayer = (pathname: string) =>
  matchPath('/report/:reportCode/:fightId/:player/*', pathname);

export const getMatchWithBuild = (pathname: string) =>
  matchPath('/report/:reportCode/:fightId/:player/:build/*', pathname);

export const getMatchWithResultTab = (pathname: string) =>
  matchPath('/report/:reportCode/:fightId/:player/:build/:resultTab', pathname);
