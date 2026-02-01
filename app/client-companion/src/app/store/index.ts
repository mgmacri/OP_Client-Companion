import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all } from "redux-saga/effects";
import logFormReducer from "../../features/logForm/state/logFormSlice";
import queueSyncSaga from "../../features/logForm/sagas/queueSyncSaga";

const sagaMiddleware = createSagaMiddleware();

function* rootSaga() {
  yield all([queueSyncSaga()]);
}

export const store = configureStore({
  reducer: {
    logForm: logFormReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
