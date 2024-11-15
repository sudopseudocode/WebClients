import { type FC, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { c } from 'ttag';

import { useItemsActions } from '@proton/pass/components/Item/ItemActionsProvider';
import { DropdownMenuButton } from '@proton/pass/components/Layout/Dropdown/DropdownMenuButton';
import { useItemDrop } from '@proton/pass/hooks/useItemDrag';
import { intoBulkSelection } from '@proton/pass/lib/items/item.utils';
import { selectTrashedItems } from '@proton/pass/store/selectors';
import type { UniqueItem } from '@proton/pass/types';
import clsx from '@proton/utils/clsx';

type Props = {
    dense?: boolean;
    selected: boolean;
    handleTrashEmpty: () => void;
    handleTrashRestore: () => void;
    onSelect: () => void;
};

export const TrashItem: FC<Props> = ({ dense, selected, handleTrashRestore, handleTrashEmpty, onSelect }) => {
    const count = useSelector(selectTrashedItems).length;
    const { trashMany } = useItemsActions();

    const onDrop = useCallback((items: UniqueItem[]) => trashMany(intoBulkSelection(items)), []);
    const { dragOver, dragProps } = useItemDrop(onDrop);

    return (
        <DropdownMenuButton
            label={c('Label').t`Trash`}
            icon="trash"
            onClick={onSelect}
            className={clsx((selected || dragOver) && 'is-selected', !dense && 'py-3')}
            parentClassName="pass-vault-submenu-vault-item w-full"
            quickActions={[
                <DropdownMenuButton
                    key="trash-restore"
                    onClick={handleTrashRestore}
                    label={c('Label').t`Restore all items`}
                    icon="arrow-up-and-left"
                />,

                <DropdownMenuButton
                    key="trash-empty"
                    onClick={handleTrashEmpty}
                    label={c('Label').t`Empty trash`}
                    icon="trash-cross"
                    danger
                />,
            ]}
            extra={<span className="pass-vault--count shrink-0 color-weak mx-1">{count}</span>}
            {...dragProps}
        />
    );
};
