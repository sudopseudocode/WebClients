import type { FC, ReactElement } from 'react';

import { useIFrameContext } from 'proton-pass-extension/app/content/injections/apps/components/IFrameApp';
import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { Icon } from '@proton/components';
import { PassIcon } from '@proton/pass/components/Layout/Icon/PassIcon';
import { PassIconStatus } from '@proton/pass/types/data/pass-icon';

type Props = {
    discardOnClose?: boolean;
    extra?: ReactElement;
    title: string;
    onClose?: () => void;
};

export const NotificationHeader: FC<Props> = ({ discardOnClose = true, extra, title, onClose }) => {
    const { close } = useIFrameContext();

    return (
        <div className="flex flex-nowrap shrink-0 items-center justify-space-between gap-2">
            <h3 className="flex text-bold text-lg items-center gap-2">
                <PassIcon status={PassIconStatus.ACTIVE} size={5.5} />
                <span className="flex-1 text-ellipsis">{title}</span>
            </h3>

            <div className="flex shrink-0 gap-1">
                {extra}
                <Button
                    key="close-button"
                    icon
                    pill
                    shape="solid"
                    color="weak"
                    size="small"
                    className="shrink-0"
                    onClick={() => {
                        onClose?.();
                        close({ discard: discardOnClose });
                    }}
                    title={c('Action').t`Cancel`}
                >
                    <Icon name="cross" alt={c('Action').t`Cancel`} size={4} />
                </Button>
            </div>
        </div>
    );
};
