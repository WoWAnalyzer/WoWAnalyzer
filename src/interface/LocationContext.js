import React from 'react';
import { withRouter } from 'react-router-dom';

const LocationContext = React.createContext(null);

export const Consumer = LocationContext.Consumer;

export const Provider = withRouter(function LocationContextProvider({ location, ...others }) {
  delete others.history;
  delete others.match;
  return <LocationContext.Provider value={location} {...others} />;
});
