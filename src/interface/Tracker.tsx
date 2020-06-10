import React from 'react';
import { useLocation } from 'react-router-dom';
import { Location } from 'history';

import { track } from 'common/analytics';

const Tracker = () => {
  const location = useLocation();
  const [previousLocation, setPreviousLocation] = React.useState<Location>();
  const getPath = (location: Location) => `${location.pathname}${location.search}`;
  React.useEffect(() => {
    // console.log('Location changed. Old:', prevProps.location, 'new:', this.props.location, document.title);
    track(previousLocation ? getPath(previousLocation) : undefined, getPath(location));
    setPreviousLocation(location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
  return null;
};

export default Tracker;
