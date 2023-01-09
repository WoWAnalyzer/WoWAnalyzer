import { applyMiddleware, createStore } from 'redux';
import createReducers from 'interface/reducers';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

const store = createStore(createReducers(), composeWithDevTools(applyMiddleware(thunk)));

export default store;
