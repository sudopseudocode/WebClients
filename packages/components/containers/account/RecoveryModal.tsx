import { useState } from 'react';

import { c } from 'ttag';

import { Button, InlineLinkButton } from '@proton/atoms';
import useLoading from '@proton/hooks/useLoading';
import { getMnemonicAuthInfo, reauthMnemonic } from '@proton/shared/lib/api/auth';
import { reauthByEmailVerification, reauthBySmsVerification } from '@proton/shared/lib/api/verify';
import { InfoResponse } from '@proton/shared/lib/authentication/interface';
import { requiredValidator } from '@proton/shared/lib/helpers/formValidators';
import { mnemonicToBase64RandomBytes } from '@proton/shared/lib/mnemonic';
import { srpAuth } from '@proton/shared/lib/srp';
import isTruthy from '@proton/utils/isTruthy';

import {
    Form,
    ModalTwo as Modal,
    ModalTwoContent as ModalContent,
    ModalTwoFooter as ModalFooter,
    ModalTwoHeader as ModalHeader,
    ModalProps,
    Tabs,
    useFormErrors,
} from '../../components';
import { useApi, useAuthentication, useUser } from '../../hooks';
import MnemonicInputField, { useMnemonicInputValidation } from '../mnemonic/MnemonicInputField';
import ChangePasswordModal, { MODES } from './ChangePasswordModal';

enum STEP {
    METHOD,
    NEW_PASSWORD,
}

interface Props extends ModalProps {
    onInitiateSessionRecoveryClick: () => void;
    onBack: () => void;
    availableRecoveryMethods: ('mnemonic' | 'email' | 'sms')[];
}

const RecoveryModal = ({
    onInitiateSessionRecoveryClick,
    onBack,
    availableRecoveryMethods,
    onClose,
    ...rest
}: Props) => {
    const api = useApi();
    const [user] = useUser();
    const authentication = useAuthentication();
    const { validator, onFormSubmit } = useFormErrors();

    const [submitting, withSubmitting] = useLoading();
    const [step, setStep] = useState(STEP.METHOD);
    const [tabIndex, setTabIndex] = useState(0);
    const [mnemonic, setMnemonic] = useState('');
    const mnemonicValidation = useMnemonicInputValidation(mnemonic);

    const currentMethod = availableRecoveryMethods[tabIndex];

    if (step === STEP.NEW_PASSWORD) {
        return (
            <ChangePasswordModal onClose={onClose} {...rest} mode={MODES.CHANGE_ONE_PASSWORD_MODE} authCheck={false} />
        );
    }

    const onSubmit = async () => {
        if (!onFormSubmit()) {
            return;
        }

        if (currentMethod === 'email') {
            await api(reauthByEmailVerification());

            setStep(STEP.NEW_PASSWORD);
        } else if (currentMethod === 'sms') {
            await api(reauthBySmsVerification());

            setStep(STEP.NEW_PASSWORD);
        } else if (currentMethod === 'mnemonic') {
            const persistent = authentication.getPersistent();
            const randomBytes = await mnemonicToBase64RandomBytes(mnemonic);
            const info = await api<InfoResponse>(getMnemonicAuthInfo(user.Name));
            await srpAuth({
                info,
                api,
                config: reauthMnemonic({
                    Username: user.Name,
                    PersistentCookies: persistent,
                }),
                credentials: {
                    username: user.Name,
                    password: randomBytes,
                },
            });

            setStep(STEP.NEW_PASSWORD);
        }
    };

    const toProceed = c('Info').t`To proceed, we must verify the request.`;
    const emailString = c('Info').t`We’ll send a reset code to the email address you provided for account recovery.`;
    const phoneString = c('Info').t`We’ll send a reset code to the phone number you provided for account recovery.`;
    const phraseString = c('Info').t`Enter your recovery phrase to change your password now.`;

    return (
        <Modal onClose={onClose} as={Form} onSubmit={() => withSubmitting(onSubmit())} {...rest}>
            <ModalHeader title={c('Title').t`Reset password`} subline={user.Email} />
            <ModalContent>
                {availableRecoveryMethods.length > 1 && (
                    <div className="mb-2">
                        {c('Info').t`To proceed, select an account recovery method so we can verify the request.`}
                    </div>
                )}

                <Tabs
                    fullWidth
                    tabs={[
                        availableRecoveryMethods.includes('email') && {
                            title: c('Recovery method').t`Email`,
                            content: (
                                <>
                                    {availableRecoveryMethods.length === 1 ? (
                                        <div className="mt-2">
                                            {toProceed} {emailString}
                                        </div>
                                    ) : (
                                        <div className="color-weak">{emailString}</div>
                                    )}

                                    <InlineLinkButton className="mt-2" onClick={onInitiateSessionRecoveryClick}>
                                        {c('Info').t`Can’t access your recovery email?`}
                                    </InlineLinkButton>
                                </>
                            ),
                        },
                        availableRecoveryMethods.includes('sms') && {
                            title: c('Recovery method').t`Phone number`,
                            content: (
                                <>
                                    {availableRecoveryMethods.length === 1 ? (
                                        <div className="mt-2">
                                            {toProceed} {phoneString}
                                        </div>
                                    ) : (
                                        <div className="color-weak">{phoneString}</div>
                                    )}

                                    <InlineLinkButton className="mt-2" onClick={onInitiateSessionRecoveryClick}>
                                        {c('Info').t`Can’t access your recovery phone?`}
                                    </InlineLinkButton>
                                </>
                            ),
                        },
                        availableRecoveryMethods.includes('mnemonic') && {
                            title: c('Recovery method').t`Phrase`,
                            content: (
                                <>
                                    {availableRecoveryMethods.length === 1 ? (
                                        <div className="mt-2 mb-4">
                                            {toProceed} {phraseString}
                                        </div>
                                    ) : (
                                        <div className="mb-4 color-weak">{phraseString}</div>
                                    )}

                                    <MnemonicInputField
                                        disableChange={submitting}
                                        value={mnemonic}
                                        onValue={setMnemonic}
                                        autoFocus
                                        error={validator(
                                            currentMethod === 'mnemonic'
                                                ? [requiredValidator(mnemonic), ...mnemonicValidation]
                                                : []
                                        )}
                                    />

                                    <InlineLinkButton className="mt-2" onClick={onInitiateSessionRecoveryClick}>
                                        {c('Info').t`Don’t know your recovery phrase?`}
                                    </InlineLinkButton>
                                </>
                            ),
                        },
                    ].filter(isTruthy)}
                    value={tabIndex}
                    onChange={(newIndex: number) => {
                        if (submitting) {
                            return;
                        }

                        setTabIndex(newIndex);
                    }}
                />
            </ModalContent>
            <ModalFooter>
                <Button onClick={onBack}>{c('Action').t`Back`}</Button>
                <Button type="submit" color="norm" loading={submitting}>{c('Action').t`Continue`}</Button>
            </ModalFooter>
        </Modal>
    );
};

export default RecoveryModal;
