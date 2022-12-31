import { configureStore } from '@reduxjs/toolkit';
import internetExplorer from 'interface/reducers/internetExplorer';
import user from 'interface/reducers/user';
import report from 'interface/reducers/report';
import combatants from 'interface/reducers/combatants';
import reportHistory from 'interface/reducers/reportHistory';
import language from 'interface/reducers/language';
import specsIgnoredNotSupportedWarning from 'interface/reducers/specsIgnoredNotSupportedWarning';
import openModals from 'interface/reducers/openModals';
import charactersById from 'interface/reducers/charactersById';
import reportCodesIgnoredPreviousPatchWarning from 'interface/reducers/reportCodesIgnoredPreviousPatchWarning';
import tooltips from 'interface/reducers/tooltips';

export const store = configureStore({
  reducer: {
    // System
    internetExplorer,

    // App
    user,
    report,
    combatants,
    reportHistory,
    language,
    specsIgnoredNotSupportedWarning,
    openModals,
    tooltips,

    // Caching
    charactersById,
    reportCodesIgnoredPreviousPatchWarning,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
