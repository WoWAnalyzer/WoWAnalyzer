import { createMatchSelector } from 'react-router-redux';

// Not sure this is the right place to define this, but for now it allows us these selectors anywhere in the code
// resultTab part of the URL was removed, but we keep it to keep backward compability
export default createMatchSelector('/report/:reportCode?/:fightId?/:player?/:resultTab?');
