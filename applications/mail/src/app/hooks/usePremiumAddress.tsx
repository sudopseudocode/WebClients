import { useGetAddresses } from '@proton/account/addresses/hooks';
import { useProtonDomains } from '@proton/account/protonDomains/hooks';
import { useUser } from '@proton/account/user/hooks';
import { useGetUserKeys } from '@proton/account/userKeys/hooks';
import {
    AuthModal,
    type AuthModalResult,
    useApi,
    useAuthentication,
    useEventManager,
    useKTVerifier,
    useModalTwoPromise,
} from '@proton/components';
import { setupAddress } from '@proton/shared/lib/api/addresses';
import { queryUnlock } from '@proton/shared/lib/api/user';
import { DEFAULT_KEYGEN_TYPE, KEYGEN_CONFIGS } from '@proton/shared/lib/constants';
import { missingKeysSelfProcess } from '@proton/shared/lib/keys';
import noop from '@proton/utils/noop';

const usePremiumAddress = () => {
    const [user] = useUser();
    const api = useApi();
    const { call } = useEventManager();
    const authentication = useAuthentication();
    const getAddresses = useGetAddresses();
    const [{ premiumDomains }, loadingProtonDomains] = useProtonDomains();
    const getUserKeys = useGetUserKeys();
    const [Domain = ''] = premiumDomains;
    const { keyTransparencyVerify, keyTransparencyCommit } = useKTVerifier(api, async () => user);
    const [authModal, showAuthModal] = useModalTwoPromise<undefined, AuthModalResult>();

    const createPremiumAddress = async () => {
        const addresses = await getAddresses();
        const [{ DisplayName = '', Signature = '' } = {}] = addresses || [];
        await showAuthModal();
        const { Address } = await api(
            setupAddress({
                Domain,
                DisplayName: DisplayName || '', // DisplayName can be null
                Signature: Signature || '', // Signature can be null
            })
        );
        const userKeys = await getUserKeys();
        await missingKeysSelfProcess({
            api,
            userKeys,
            addresses,
            addressesToGenerate: [Address],
            password: authentication.getPassword(),
            keyGenConfig: KEYGEN_CONFIGS[DEFAULT_KEYGEN_TYPE],
            onUpdate: noop,
            keyTransparencyVerify,
        });
        await keyTransparencyCommit(userKeys);
        await call();
        return Address;
    };

    const modal = authModal((props) => {
        return (
            <AuthModal
                {...props}
                scope="locked"
                config={queryUnlock()}
                onCancel={props.onReject}
                onSuccess={props.onResolve}
            />
        );
    });

    return {
        authModal: modal,
        createPremiumAddress,
        loadingProtonDomains,
    };
};

export default usePremiumAddress;
