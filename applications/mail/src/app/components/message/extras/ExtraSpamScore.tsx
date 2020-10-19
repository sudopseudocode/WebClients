import { MESSAGE_FLAGS } from 'proton-shared/lib/mail/constants';
import { MAILBOX_LABEL_IDS } from 'proton-shared/lib/constants';
import React from 'react';
import { Icon, Href, InlineLinkButton, ConfirmModal, Alert, useModals, useLoading } from 'react-components';
import { c } from 'ttag';
import { hasBit } from 'proton-shared/lib/helpers/bitset';

import { MessageExtended } from '../../../models/message';
import { useMoveToFolder } from '../../../hooks/useApplyLabels';
import { LABEL_IDS_TO_I18N } from '../../../constants';

interface Props {
    message: MessageExtended;
    labelID: string;
}

const ExtraSpamScore = ({ message, labelID }: Props) => {
    const { createModal } = useModals();
    const [loading, withLoading] = useLoading();
    const moveToFolder = useMoveToFolder();
    const { Flags, LabelIDs = [] } = message.data || {};

    if (hasBit(Flags, MESSAGE_FLAGS.FLAG_DMARC_FAIL)) {
        return (
            <div className="bg-global-warning color-white rounded p0-5 mb0-5 flex flex-nowrap">
                <Icon name="spam" className="flex-item-noshrink mtauto mbauto" />
                <span className="pl0-5 pr0-5 flex-item-fluid">{c('Info')
                    .t`This email has failed its domain's authentication requirements. It may be spoofed or improperly forwarded!`}</span>
                <span className="flex-item-noshrink flex">
                    <Href
                        className="underline color-currentColor"
                        url="https://protonmail.com/support/knowledge-base/email-has-failed-its-domains-authentication-requirements-warning/"
                    >
                        {c('Info').t`Learn more`}
                    </Href>
                </span>
            </div>
        );
    }

    if (
        hasBit(Flags, MESSAGE_FLAGS.FLAG_PHISHING_AUTO) &&
        (!hasBit(Flags, MESSAGE_FLAGS.FLAG_HAM_MANUAL) || LabelIDs.includes(MAILBOX_LABEL_IDS.SPAM))
    ) {
        const markAsLegitimate = async () => {
            await new Promise((resolve, reject) => {
                createModal(
                    <ConfirmModal
                        title={c('Title').t`Mark email as legitimate`}
                        confirm={c('Action').t`Mark legitimate`}
                        onClose={reject}
                        onConfirm={resolve}
                    >
                        <Alert>{c('Info')
                            .t`We apologize. This might have been a mistake from our side. Can you please confirm that you want to mark this email as a legitimate one?`}</Alert>
                    </ConfirmModal>
                );
            });
            await moveToFolder(
                [message.data || {}],
                MAILBOX_LABEL_IDS.INBOX,
                LABEL_IDS_TO_I18N[MAILBOX_LABEL_IDS.INBOX],
                labelID
            );
        };
        return (
            <div className="bg-global-warning color-white rounded p0-5 mb0-5 flex flex-nowrap">
                <Icon name="spam" className="flex-item-noshrink mtauto mbauto" />
                <span className="pl0-5 pr0-5 flex-item-fluid">
                    {c('Info')
                        .t`Our system flagged this message as a phishing attempt. Please check that it is legitimate.`}
                    <Href
                        className="pl0-5 pr0-5 color-white"
                        url="https://protonmail.com/blog/prevent-phishing-attacks/"
                    >
                        {c('Info').t`Learn more`}
                    </Href>
                </span>
                <span className="flex-item-noshrink flex">
                    <InlineLinkButton
                        className="color-currentColor"
                        onClick={() => withLoading(markAsLegitimate())}
                        disabled={loading}
                    >{c('Action').t`Mark legitimate`}</InlineLinkButton>
                </span>
            </div>
        );
    }

    return null;
};

export default ExtraSpamScore;
