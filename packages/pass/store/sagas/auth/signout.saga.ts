import { put, takeLeading } from 'redux-saga/effects';

import { api } from '@proton/pass/lib/api/api';
import { signoutIntent, signoutSuccess } from '@proton/pass/store/actions';
import type { WorkerRootSagaOptions } from '@proton/pass/store/types';
import { revoke } from '@proton/shared/lib/api/auth';

function* signoutIntentWorker({ onSignout }: WorkerRootSagaOptions, action: ReturnType<typeof signoutIntent>) {
    if (!action.payload.soft) yield api({ ...revoke(), silent: true });
    onSignout?.();

    yield put(signoutSuccess(action.payload));
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeLeading(signoutIntent.match, signoutIntentWorker, options);
}
