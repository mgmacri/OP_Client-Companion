import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all, fork } from "redux-saga/effects";
import { useDispatch, useSelector } from "react-redux";

// Reducers
import logFormReducer from "../../features/logForm/state/logFormSlice";
import clientsReducer from "../../features/clients/state/clientsSlice";
import assignmentsReducer from "../../features/assignments/state/assignmentsSlice";
import entriesReducer from "../../features/entries/state/entriesSlice";

// Sagas
import queueSyncSaga from "../../features/logForm/sagas/queueSyncSaga";
import persistenceSaga from "../../features/persistence/sagas/persistenceSaga";

const sagaMiddleware = createSagaMiddleware();

function* rootSaga() {
  yield all([
    fork(queueSyncSaga),
    fork(persistenceSaga),
  ]);
}

export const store = configureStore({
  reducer: {
    logForm: logFormReducer,
    clients: clientsReducer,
    assignments: assignmentsReducer,
    entries: entriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);
