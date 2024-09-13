import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import { getAllLocalSessions, getPersistedSession, getSessionKey } from 'proton-pass-web/lib/sessions';

import useInstance from '@proton/hooks/useInstance';
import { useAuthStore } from '@proton/pass/components/Core/AuthStoreProvider';
import { reloadHref } from '@proton/pass/components/Navigation/routing';
import { createUseContext } from '@proton/pass/hooks/useContextFactory';
import { api } from '@proton/pass/lib/api/api';
import { encodeUserData } from '@proton/pass/lib/auth/store';
import { type AuthSwitchService, type SwitchableSession, createAuthSwitchService } from '@proton/pass/lib/auth/switch';
import { type MaybeNull } from '@proton/pass/types';

export const AuthSwitchContext = createContext<MaybeNull<AuthSwitchService>>(null);
export const SessionsContext = createContext<SwitchableSession[]>([]);

export const useAuthSwitch = createUseContext(AuthSwitchContext);
export const useSessions = () => useContext(SessionsContext);

export const useAvailableSessions = () => {
    const sessions = useSessions();
    const authStore = useAuthStore();

    return useMemo(() => {
        const currentLocalID = authStore?.getLocalID();
        return sessions.filter(({ LocalID, PrimaryEmail, DisplayName }) =>
            Boolean(LocalID !== currentLocalID && (PrimaryEmail || DisplayName))
        );
    }, [sessions]);
};

export const AuthSwitchProvider: FC<PropsWithChildren> = ({ children }) => {
    const authStore = useAuthStore();
    const [sessions, setSessions] = useState<SwitchableSession[]>([]);

    const service = useInstance(() =>
        createAuthSwitchService({
            api,

            onSwitch: (LocalID: number) => {
                authStore?.clear();
                reloadHref(`/u/${LocalID}`);
            },

            getLocalSessions: getAllLocalSessions,

            onActiveSession: ({ LocalID, PrimaryEmail, DisplayName }) => {
                /** Sync the current auth store session  */
                if (LocalID === authStore?.getLocalID()) {
                    authStore.setUserDisplayName(DisplayName);
                    authStore.setUserEmail(PrimaryEmail);
                }

                const localSession = getPersistedSession(LocalID);
                if (localSession) {
                    localSession.userData = encodeUserData(PrimaryEmail, DisplayName);
                    localStorage.setItem(getSessionKey(LocalID), JSON.stringify(localSession));
                }
            },

            onInactiveSession: (session) => {
                setSessions((prev) => prev.filter(({ UID }) => session.UID !== UID));
                /** FIXME: on inactive session detection,
                 * we should delete the persisted session,
                 * the Pass DB and all data for the userID */
            },

            onSessionsSynced: setSessions,
        })
    );

    return (
        <AuthSwitchContext.Provider value={service}>
            <SessionsContext.Provider value={sessions}>{children}</SessionsContext.Provider>
        </AuthSwitchContext.Provider>
    );
};
