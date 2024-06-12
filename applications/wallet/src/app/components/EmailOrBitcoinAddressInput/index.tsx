import { KeyboardEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { QRCode } from 'jsqr';
import { compact } from 'lodash';
import { c } from 'ttag';

import { WasmNetwork } from '@proton/andromeda';
import { CircleLoader } from '@proton/atoms/CircleLoader';
import {
    AddressesAutocompleteItem,
    Dropdown,
    DropdownSizeUnit,
    Icon,
    Marks,
    getContactsAutocompleteItems,
    getRecipientFromAutocompleteItem,
    useAutocompleteFilter,
    useModalState,
} from '@proton/components/components';
import { canonicalizeEmail, validateEmailAddress } from '@proton/shared/lib/helpers/email';
import { MatchChunk } from '@proton/shared/lib/helpers/regex';
import { getInitials } from '@proton/shared/lib/helpers/string';
import { Recipient } from '@proton/shared/lib/interfaces';
import { ContactEmail } from '@proton/shared/lib/interfaces/contacts';
import { SimpleMap } from '@proton/shared/lib/interfaces/utils';
import { handleRecipientInputChange, inputToRecipient, splitBySeparator } from '@proton/shared/lib/mail/recipient';
import clsx from '@proton/utils/clsx';

import { CoreButton, Input, InputProps } from '../../atoms';
import { MAX_RECIPIENTS_PER_TRANSACTIONS } from '../../constants/email-integration';
import { getThemeByIndex, isValidBitcoinAddress } from '../../utils';
import { QRCodeReaderModal } from '../QRCodeReaderModal';
import { RecipientEmailMap } from './useEmailAndBtcAddressesMaps';

import './EmailOrBitcoinAddressInput.scss';

export interface RecipientWithBtcAddress extends Recipient {
    btcAddress: { value?: string; error?: string };
}

interface Props extends Omit<InputProps, 'label' | 'value' | 'onChange'> {
    onAddRecipients: (recipients: Recipient[]) => void;
    onRemoveRecipient?: (recipient: Recipient) => void;
    recipientEmailMap: RecipientEmailMap;
    contactEmails?: ContactEmail[];
    contactEmailsMap?: SimpleMap<ContactEmail>;
    limit?: number;
    onChange?: (value: string) => void;
    excludedEmails?: string[];
    loading?: boolean;
    network: WasmNetwork;
    fetchedEmailListItemRightNode: ({ email, error }: { email: string; error?: string }) => JSX.Element | null;
}

interface EmailListItemProps {
    index: number;
    chunks?: MatchChunk[];
    name?: string;
    address: string;
    onClick?: () => void;
    leftNode?: ReactNode;
    rightNode?: ReactNode;
    loading?: boolean;
}

export const EmailListItem = ({
    index,
    chunks = [],
    name,
    address,
    loading,
    leftNode,
    rightNode,
    onClick,
}: EmailListItemProps) => {
    const inner = (
        <>
            {leftNode}
            {loading ? (
                <CircleLoader className="color-primary" />
            ) : (
                <>
                    <div
                        className={clsx(
                            'rounded-full w-custom h-custom mr-4 flex items-center justify-center text-lg text-semibold no-shrink',
                            getThemeByIndex(index)
                        )}
                        style={{
                            '--h-custom': '2.5rem',
                            '--w-custom': '2.5rem',
                            background: 'var(--interaction-norm-minor-1)',
                            color: 'var(--interaction-norm)',
                        }}
                    >
                        {getInitials(name || address)}
                    </div>
                    <div className="flex flex-column justify-center items-center mr-auto">
                        <span className={clsx('block w-full text-ellipsis text-left text-lg')}>
                            {<Marks chunks={chunks}>{name || address}</Marks>}
                        </span>
                        {Boolean(name && address) && name !== address && (
                            <span className={clsx('block w-full text-ellipsis text-left color-hint')}>
                                {<Marks chunks={chunks}>{address}</Marks>}
                            </span>
                        )}
                    </div>
                </>
            )}
            {rightNode}
        </>
    );

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className="email-select-button flex flex-row w-full flex-nowrap items-center grow p-2 rounded-lg"
            >
                {inner}
            </button>
        );
    }

    return <div className="flex flex-row w-full flex-nowrap items-center grow py-2 rounded-lg">{inner}</div>;
};

const validateInput = (input: string, network: WasmNetwork) => {
    if (!validateEmailAddress(input) && !isValidBitcoinAddress(input, network)) {
        return c('Error').t`Input isn't a valid email or bitcoin address`;
    }
};

export const EmailOrBitcoinAddressInput = ({
    contactEmails,
    contactEmailsMap,
    recipientEmailMap,
    limit = 10,
    onChange,
    onAddRecipients,
    onRemoveRecipient,
    excludedEmails = [],
    network,
    loading,
    disabled,
    fetchedEmailListItemRightNode,
    ...rest
}: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const [input, setInput] = useState('');
    const [emailError, setEmailError] = useState('');

    const [qrCodeModal, setQrCodeModal] = useModalState();

    const recipientsWithBtcAddress = compact(Object.values(recipientEmailMap));

    const [recipientsByAddress] = useMemo(() => {
        return recipientsWithBtcAddress.reduce<[Set<string>, Set<string>]>(
            (acc, { recipient: { Address } }) => {
                if (Address) {
                    acc[0].add(canonicalizeEmail(Address));
                }

                return acc;
            },
            [new Set(), new Set()]
        );
    }, [recipientsWithBtcAddress]);

    const filteredContactEmails = useMemo(
        () => contactEmails?.filter(({ Email }) => !excludedEmails.includes(Email)),
        [contactEmails, excludedEmails]
    );

    const contactsAutocompleteItems = useMemo(() => {
        return getContactsAutocompleteItems(
            filteredContactEmails,
            ({ Email }) => !recipientsByAddress.has(canonicalizeEmail(Email)) && !validateInput(Email, network)
        );
    }, [filteredContactEmails, recipientsByAddress, network]);

    const safeAddRecipients = useCallback(
        (newRecipients: Recipient[]) => {
            const recipients = newRecipients.filter(({ Address }) => {
                return !validateInput(Address || '', network);
            });

            if (recipients.length) {
                setInput('');
                setEmailError('');
                onAddRecipients(recipients);
            }
        },
        [onAddRecipients, network]
    );

    useEffect(() => {
        inputRef.current?.focus();
    });

    const handleAddRecipientFromInput = (input: string) => {
        const trimmedInput = input.trim();
        if (!trimmedInput.length) {
            setInput('');
            return;
        }

        const inputs = splitBySeparator(trimmedInput);

        const recipients = inputs.map((input) => inputToRecipient(input));
        const { validRecipients, invalidRecipients, errors } = recipients.reduce<{
            validRecipients: Recipient[];
            invalidRecipients: Recipient[];
            errors: string[];
        }>(
            (acc, recipient) => {
                const error = validateInput(recipient.Address || '', network);
                if (error) {
                    acc.errors.push(error);
                    acc.invalidRecipients.push(recipient);
                } else {
                    acc.validRecipients.push(recipient);
                }
                return acc;
            },
            { validRecipients: [], invalidRecipients: [], errors: [] }
        );

        safeAddRecipients(validRecipients);

        if (errors.length) {
            setEmailError(errors[0]);
            setInput(invalidRecipients.map(({ Address }) => Address).join(', '));
        }
    };

    const handleSelect = useCallback(
        (item: AddressesAutocompleteItem) => {
            safeAddRecipients(getRecipientFromAutocompleteItem(contactEmails, item));
        },
        [safeAddRecipients, contactEmails]
    );

    const getData = useCallback((value: { label: string }) => {
        return value.label;
    }, []);

    const filteredOptions = useAutocompleteFilter(input, contactsAutocompleteItems, getData, limit, 1);

    const handleInputChange = (newValue: string) => {
        handleRecipientInputChange(newValue, true, safeAddRecipients, setInput);
    };

    const handleAddRecipientFromScan = (qrcode: QRCode) => {
        const value = qrcode.data.trimStart();
        handleInputChange(value);
        onChange?.(value);

        qrCodeModal.onClose();
    };

    const listContent = useMemo(() => {
        if (recipientsWithBtcAddress?.length) {
            return (
                <ul className="unstyled m-0 w-full">
                    {recipientsWithBtcAddress.map(({ recipient, btcAddress }, index) => {
                        return (
                            <li key={`${recipient.ContactID}-${index}`} title={recipient.Address} className="flex">
                                <EmailListItem
                                    index={index}
                                    address={recipient.Address}
                                    name={recipient.Name}
                                    rightNode={fetchedEmailListItemRightNode({
                                        email: recipient.Address,
                                        error: btcAddress.error,
                                    })}
                                    leftNode={
                                        onRemoveRecipient && (
                                            <CoreButton
                                                shape="ghost"
                                                color="weak"
                                                className="mr-1 no-shrink rounded-full"
                                                size="small"
                                                icon
                                                onClick={() => onRemoveRecipient(recipient)}
                                            >
                                                <Icon name="cross" />
                                            </CoreButton>
                                        )
                                    }
                                />
                            </li>
                        );
                    })}
                </ul>
            );
        }

        // TODO: implement this later
        const recentRecipients = [];

        return (
            <>
                <div className="flex flex-row flex-nowrap bg-norm items-center p-4 rounded-lg">
                    <div
                        className="rounded-full bg-weak w-custom h-custom flex mr-4"
                        style={{ '--h-custom': '2.5rem', '--w-custom': '2.5rem' }}
                    >
                        <Icon name="lightbulb" size={5} className="m-auto" />
                    </div>
                    <span className="block color-weak">{c('Wallet send')
                        .t`Try adding an email address to start sending Bitcoin!`}</span>
                </div>

                {recentRecipients.length ? (
                    <span className="block mt-6 color-hint text-sm mb-1">{c('Wallet send').t`Recent recipients`}</span>
                ) : null}
            </>
        );
    }, [fetchedEmailListItemRightNode, onRemoveRecipient, recipientsWithBtcAddress]);

    return (
        <>
            <div className="flex flex-column flex-nowrap justify-center w-full grow">
                <div className="mb-4 w-full shrink-0">
                    <Input
                        {...rest}
                        label={c('Bitcoin send').t`To`}
                        placeholder={c('Bitcoin send').t`Recipient email or BTC address`}
                        dense
                        ref={inputRef}
                        autoFocus
                        value={input}
                        disabled={recipientsWithBtcAddress.length >= MAX_RECIPIENTS_PER_TRANSACTIONS || disabled}
                        data-protonpass-ignore
                        onValue={(value: string) => {
                            handleInputChange(value.trimStart());
                            onChange?.(value);
                        }}
                        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                            setEmailError('');
                            if (event.key === 'Enter') {
                                handleAddRecipientFromInput(input);
                                event.preventDefault();
                            }
                        }}
                        hint={
                            recipientsWithBtcAddress.length >= MAX_RECIPIENTS_PER_TRANSACTIONS &&
                            c('Wallet send')
                                .t`Max recipients per transaction limit reached (${MAX_RECIPIENTS_PER_TRANSACTIONS})`
                        }
                        className={clsx([rest.className])}
                        containerClassName="border"
                        style={rest.style}
                        error={emailError}
                        suffix={
                            <CoreButton
                                icon
                                size="small"
                                shape="ghost"
                                onClick={() => {
                                    setQrCodeModal(true);
                                }}
                            >
                                <Icon className="color-weak" name="camera" />
                            </CoreButton>
                        }
                    />
                </div>

                <Dropdown
                    size={{
                        width: DropdownSizeUnit.Anchor,
                        maxHeight: DropdownSizeUnit.Viewport,
                        maxWidth: DropdownSizeUnit.Viewport,
                    }}
                    isOpen={!!filteredOptions.length}
                    anchorRef={inputRef}
                    onFocus={() => {
                        inputRef.current?.focus();
                    }}
                >
                    <ul className="unstyled m-0 w-full p-2">
                        {filteredOptions.map(({ chunks, option }, index) => {
                            return (
                                <li key={`${option.key}-${index}`} title={option.label} className="flex">
                                    <EmailListItem
                                        index={index}
                                        chunks={chunks}
                                        name={option.value.Name}
                                        address={option.value.Email}
                                        onClick={() => handleSelect(option)}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </Dropdown>

                <div className="flex flex-column justify-center grow w-full">
                    <div className="grow max-w-full overflow-auto">{listContent}</div>
                    {loading && (
                        <div className="flex my-3 py-8">
                            <CircleLoader className="color-primary mx-auto" />
                        </div>
                    )}
                </div>
            </div>

            <QRCodeReaderModal onScan={handleAddRecipientFromScan} {...qrCodeModal} />
        </>
    );
};
