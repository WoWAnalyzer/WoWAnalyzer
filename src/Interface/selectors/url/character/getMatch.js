import { createMatchSelector } from 'react-router-redux';

// Not sure this is the right place to define this, but for now it allows us these selectors anywhere in the code
export default createMatchSelector('/character/:charRegion/:charRealm/:charName');
