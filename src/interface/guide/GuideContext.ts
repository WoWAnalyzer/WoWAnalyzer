import React from 'react';
import { GuideContextValue } from './types';

const GuideContext = React.createContext<GuideContextValue>({
  modules: {},
  events: [],
});

export default GuideContext;
