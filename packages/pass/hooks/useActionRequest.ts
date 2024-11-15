import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { ActionCreatorWithPreparedPayload } from '@reduxjs/toolkit';
import type { Action } from 'redux';

import { withRevalidate } from '@proton/pass/store/request/enhancers';
import type { RequestFlow } from '@proton/pass/store/request/flow';
import type { ActionRequestEntry, RequestMeta, WithRequest } from '@proton/pass/store/request/types';
import { selectRequest } from '@proton/pass/store/selectors';
import type { Maybe, MaybePromise } from '@proton/pass/types/utils';

export type UseActionRequestOptions<
    IntentAction extends WithRequest<Action, 'start', any> = any,
    SuccessAction extends WithRequest<Action, 'success', any> = any,
    FailureAction extends WithRequest<Action, 'failure', any> = any,
> = {
    loading?: boolean;
    requestId?: string;
    onStart?: (request: ActionRequestEntry<IntentAction>) => MaybePromise<void>;
    onSuccess?: (request: ActionRequestEntry<SuccessAction>) => MaybePromise<void>;
    onFailure?: (request: ActionRequestEntry<FailureAction>) => MaybePromise<void>;
};

/* `options` is wrapped in a ref to avoid setting it as
 * a dependency to the status change effect. We only want
 * to trigger the callbacks once. */
export const useActionRequest = <
    IntentAction extends ActionCreatorWithPreparedPayload<any[], any, string, never, RequestMeta<'start', any>>,
    SuccessAction extends ActionCreatorWithPreparedPayload<any[], any, string, never, RequestMeta<'success', any>>,
    FailureAction extends ActionCreatorWithPreparedPayload<any[], any, string, never, RequestMeta<'failure', any>>,
>(
    intent: IntentAction,
    options?: UseActionRequestOptions<ReturnType<IntentAction>, ReturnType<SuccessAction>, ReturnType<FailureAction>>
) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(options?.loading ?? false);
    const [error, setError] = useState(false);
    const [requestId, setRequestId] = useState<string>(options?.requestId ?? '');
    const request = useSelector(selectRequest(requestId));

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const progress = (() => {
        if (!request) return 0;
        return request?.status === 'start' ? (request.progress ?? 0) : 100;
    })();

    useEffect(() => {
        if (!request) return setLoading(false);

        switch (request.status) {
            case 'start':
                setLoading(true);
                setError(false);
                void optionsRef.current?.onStart?.(request as any);
                break;
            case 'success':
                setLoading(false);
                setError(false);
                void optionsRef.current?.onSuccess?.(request as any);
                break;
            case 'failure':
                setLoading(false);
                setError(true);
                void optionsRef.current?.onFailure?.(request as any);
                break;
        }
    }, [request]);

    return useMemo(() => {
        const actionCreator = (...args: Parameters<IntentAction>) => {
            const action = intent(...args);
            setRequestId(action.meta.request.id);
            return action;
        };

        return {
            dispatch: (...args: Parameters<IntentAction>) => {
                dispatch(actionCreator(...args));
            },
            revalidate: (...args: Parameters<IntentAction>) => {
                dispatch(withRevalidate(actionCreator(...args)));
            },
            progress,
            loading,
            error,
        };
    }, [request, progress, loading]);
};

type UseRequestOptions<T extends RequestFlow<any, any, any>> = {
    /** Initial loading state */
    loading?: boolean;
    /** Initial request parameters
     * - Pass `IntentDTO` if request key preparator requires parameters
     * - Pass true to start tracking immediately if no parameters needed
     * - Omit to skip initial tracking */
    initial?: Parameters<T['requestID']>[0] extends infer U ? (U extends void ? true : U) : never;
    /** Called when request is initiated. Receives intent action request metadata */
    onStart?: (request: ActionRequestEntry<ReturnType<T['intent']>>) => MaybePromise<void>;
    /** Called when request fails. Receives failure action request metadata */
    onFailure?: (request: ActionRequestEntry<ReturnType<T['failure']>>) => MaybePromise<void>;
    /** Called when request succeeds. Receives success action request metadata */
    onSuccess?: (request: ActionRequestEntry<ReturnType<T['success']>>) => MaybePromise<void>;
};

export const useRequest = <T extends RequestFlow<any, any, any>>(
    actions: T,
    { initial, ...options }: UseRequestOptions<T> = {}
) => {
    const [data, setData] = useState<Maybe<ActionRequestEntry<ReturnType<T['success']>>['data']>>();

    const requestId = (() => {
        if (!initial) return;
        return actions.requestID(initial === true ? undefined : initial);
    })();

    const req = useActionRequest<T['intent'], T['success'], T['failure']>(actions.intent, {
        ...options,
        requestId,
        onSuccess: (req) => {
            if (req.data) setData(req.data);
            return options?.onSuccess?.(req);
        },
    });

    return useMemo(() => ({ ...req, data }), [req, data]);
};
