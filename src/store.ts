import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createReduxEnhancer as sentryCreateReduxEnhancer } from '@sentry/react';
import internetExplorerReducer from 'interface/reducers/internetExplorer';
import userReducer from 'interface/reducers/user';
import combatantsReducer from 'interface/reducers/combatants';
import reportHistoryReducer from 'interface/reducers/reportHistory';
import languageReducer from 'interface/reducers/language';
import specsIgnoredNotSupportedWarningReducer from 'interface/reducers/specsIgnoredNotSupportedWarning';
import openModalsReducer from 'interface/reducers/openModals';
import charactersByIdReducer from 'interface/reducers/charactersById';
import reportCodesIgnoredPreviousPatchWarningReducer from 'interface/reducers/reportCodesIgnoredPreviousPatchWarning';
import tooltipsReducer from 'interface/reducers/tooltips';
import { isPresent } from 'common/typeGuards';

import { reducer as navigationReducer } from './interface/reducers/navigation';

const rootReducer = combineReducers({
  // System
  internetExplorer: internetExplorerReducer,

  // App
  user: userReducer,
  navigation: navigationReducer,
  combatants: combatantsReducer,
  reportHistory: reportHistoryReducer,
  language: languageReducer,
  specsIgnoredNotSupportedWarning: specsIgnoredNotSupportedWarningReducer,
  openModals: openModalsReducer,
  tooltips: tooltipsReducer,

  // Caching
  charactersById: charactersByIdReducer,
  reportCodesIgnoredPreviousPatchWarning: reportCodesIgnoredPreviousPatchWarningReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  enhancers: [import.meta.env.VITE_SENTRY_DSN ? sentryCreateReduxEnhancer({}) : null].filter(
    isPresent,
  ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
