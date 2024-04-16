import { useMemo, useState } from 'react';

import { c } from 'ttag';

import Href from '@proton/atoms/Href/Href';
import Pill from '@proton/atoms/Pill/Pill';
import Copy from '@proton/components/components/button/Copy';
import Label from '@proton/components/components/label/Label';
import Tooltip from '@proton/components/components/tooltip/Tooltip';
import TextAreaTwo from '@proton/components/components/v2/input/TextArea';
import { useWalletSettings } from '@proton/wallet';

import { BitcoinAmount } from '../../atoms';
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '../../constants';
import { useUserExchangeRate } from '../../hooks/useUserExchangeRate';
import { TransactionData } from '../../hooks/useWalletTransactions';

export interface OnchainTransactionDetailsProps {
    from?: { walletName: string; accountName: string };
    tx: TransactionData;
    isNotBroadcasted?: boolean;
    onUpdateLabel?: (label: string) => void;
}

export const OnchainTransactionDetails = ({
    from,
    tx,
    isNotBroadcasted,
    onUpdateLabel,
}: OnchainTransactionDetailsProps) => {
    const [walletSettings, loadingSettings] = useWalletSettings();
    const [exchangeRate, loadingExchangeRate] = useUserExchangeRate();

    const { networkData, apiData } = tx;

    const recipients = useMemo(() => {
        const txValue = networkData.received - networkData.sent;

        return networkData.outputs.filter((output) => {
            /**
             * when tx is a sending we want to display external recipient(s)
             * when tx is a receive, we want to display internal recipient(s)
             * displaying change address would be confusing
             */
            return txValue > 0 ? output.is_mine : !output.is_mine;
        });
    }, [networkData.outputs, networkData.received, networkData.sent]);

    const txFees = Number(networkData.fee ?? 0);
    const totalAmount = recipients.reduce((acc, cur) => acc + Number(cur.value), txFees);

    const [labelInput, setLabelInput] = useState(apiData?.Label ?? '');

    return (
        <div>
            {/* From */}
            {from && (
                <div>
                    <span className="text-sm color-hint">{c('Wallet Transaction Details').t`From`}</span>
                    <div className="flex flex-row mt-1">
                        <span className="block px-3 py-1 mr-3 rounded bg-weak text-semibold">{from.walletName}</span>
                        <span className="block px-3 py-1 rounded bg-weak text-semibold">{from.accountName}</span>
                    </div>
                </div>
            )}

            {/* To */}
            <div className="mt-4">
                <div className="flex flex-row w-full">
                    <span className="text-sm color-hint w-3/5 border-none">{c('Wallet Transaction Details')
                        .t`To recipients`}</span>
                    <span className="block w-1/5" title={c('Wallet Transaction Details').t`Fiat amount`} />
                    <span className="block w-1/5" title={c('Wallet Transaction Details').t`Sats amount`} />
                </div>

                <ul className="list-unstyled my-2 p-0">
                    {/* Recipients */}
                    {recipients.length ? (
                        recipients.map((recipient, index) => {
                            const { address, value: amount } = recipient;

                            return (
                                <li className="flex flex-row w-full items-center" key={`${address}_${amount}_${index}`}>
                                    <Tooltip title={address}>
                                        <span className="w-2/5 mr-auto px-3 py-1 text-monospace rounded bg-weak text-semibold text-ellipsis">
                                            {address}
                                        </span>
                                    </Tooltip>

                                    <BitcoinAmount
                                        firstClassName="block w-1/5 color-hint"
                                        exchangeRate={{ value: exchangeRate, loading: loadingExchangeRate }}
                                        bitcoin={Number(amount)}
                                    />

                                    <BitcoinAmount
                                        firstClassName="w-1/5 text-right"
                                        unit={{ value: walletSettings?.BitcoinUnit, loading: loadingSettings }}
                                        bitcoin={Number(amount)}
                                    />
                                </li>
                            );
                        })
                    ) : (
                        <Pill backgroundColor="#ecff9b">{c('Wallet Transaction Details').t`Self transfer`}</Pill>
                    )}

                    {/* Fees */}
                    <li className="flex flex-row w-full mt-4 py-2 border-bottom border-top">
                        <span className="w-3/5">{c('Wallet Transaction Details').t`Fees`}</span>

                        <BitcoinAmount
                            firstClassName="block w-1/5 color-hint"
                            exchangeRate={{ value: exchangeRate, loading: loadingExchangeRate }}
                            bitcoin={Number(txFees)}
                        />

                        <BitcoinAmount
                            firstClassName="w-1/5 text-right"
                            unit={{ value: walletSettings?.BitcoinUnit, loading: loadingSettings }}
                            bitcoin={txFees}
                        />
                    </li>

                    {/* Total */}
                    <li className="flex flex-row w-full mt-4 pt-2 border-bottom">
                        <span className="w-3/5">{c('Wallet Transaction Details').t`Total`}</span>

                        <BitcoinAmount
                            firstClassName="block w-1/5 color-hint"
                            exchangeRate={{ value: exchangeRate, loading: loadingExchangeRate }}
                            bitcoin={Number(totalAmount)}
                        />

                        <BitcoinAmount
                            firstClassName="w-1/5 text-right"
                            unit={{ value: walletSettings?.BitcoinUnit, loading: loadingSettings }}
                            bitcoin={Number(totalAmount)}
                        />
                    </li>
                </ul>
            </div>

            <div className="my-4">
                <span className="text-sm color-hint">{c('Wallet Transaction Details').t`Transaction Id`}</span>
                <div className="flex flex-row flex-nowrap items-center">
                    <Tooltip title={networkData.txid}>
                        {isNotBroadcasted ? (
                            <span>{networkData.txid}</span>
                        ) : (
                            <Href
                                href={`${BLOCKCHAIN_EXPLORER_BASE_URL}/${networkData.txid}`}
                                target="_blank"
                                className="block text-ellipsis"
                            >
                                {networkData.txid}
                            </Href>
                        )}
                    </Tooltip>
                    <Copy className="ml-2" value={networkData.txid} shape="ghost" />
                </div>
            </div>

            {apiData && onUpdateLabel && (
                <div className="my-4">
                    <Label className="mb-4 block">{c('Wallet Send').t`Note`}</Label>
                    <TextAreaTwo
                        id="transaction-note"
                        className="mb-4"
                        value={labelInput}
                        onValue={(input: string) => setLabelInput(input)}
                        onBlur={() => onUpdateLabel(labelInput)}
                        autoFocus={!!apiData}
                        disabled={!apiData}
                        required
                        rows={2}
                    />
                </div>
            )}
        </div>
    );
};
