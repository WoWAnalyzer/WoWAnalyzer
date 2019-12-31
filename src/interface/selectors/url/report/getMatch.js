import { createMatchSelector } from 'connected-react-router';

// Not sure this is the right place to define this, but for now it allows us these selectors anywhere in the code
export default createMatchSelector('/report/:reportCode?/:fightId?/:player?/:build?/:resultTab?');
