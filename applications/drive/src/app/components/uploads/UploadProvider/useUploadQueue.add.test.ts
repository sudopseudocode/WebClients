import { renderHook, act } from '@testing-library/react-hooks';

import { mockGlobalFile, testFile } from '../../../helpers/test/file';
import { UploadFileList } from '../interface';
import { FileUpload, FolderUpload, UploadQueue } from './interface';
import useUploadQueue, { addItemToQueue } from './useUploadQueue';

function createEmptyQueue(): UploadQueue {
    return {
        shareId: 'shareId',
        parentId: 'parentId',
        files: [],
        folders: [],
    };
}

describe('useUploadQueue::add', () => {
    let hook: {
        current: {
            fileUploads: FileUpload[];
            folderUploads: FolderUpload[];
            add: (shareId: string, parentId: string, fileList: UploadFileList) => void;
        };
    };

    beforeEach(() => {
        mockGlobalFile();
        const { result } = renderHook(() => useUploadQueue());
        hook = result;
    });

    it('creates new upload queue', () => {
        act(() => {
            hook.current.add('shareId', 'parentId', [{ path: [], folder: 'folder' }]);
            hook.current.add('shareId2', 'parentId2', [{ path: [], folder: 'folder' }]);
        });
        expect(hook.current.folderUploads).toMatchObject([
            {
                name: 'folder',
                shareId: 'shareId',
                parentId: 'parentId',
            },
            {
                name: 'folder',
                shareId: 'shareId2',
                parentId: 'parentId2',
            },
        ]);
    });

    it('merges upload queue', () => {
        act(() => {
            hook.current.add('shareId', 'parentId', [{ path: [], folder: 'folder' }]);
            hook.current.add('shareId', 'parentId', [{ path: [], folder: 'folder2' }]);
        });
        expect(hook.current.folderUploads).toMatchObject([
            {
                name: 'folder',
                shareId: 'shareId',
                parentId: 'parentId',
            },
            {
                name: 'folder2',
                shareId: 'shareId',
                parentId: 'parentId',
            },
        ]);
    });

    it('throws error when adding file with empty name', () => {
        expect(() => {
            addItemToQueue('shareId', createEmptyQueue(), { path: [], file: testFile('') });
        }).toThrow('File or folder is missing a name');
    });

    it('throws error when adding folder with empty name', () => {
        expect(() => {
            addItemToQueue('shareId', createEmptyQueue(), { path: [], folder: '' });
        }).toThrow('File or folder is missing a name');
    });

    it('throws error when adding file to non-existing folder', () => {
        expect(() => {
            addItemToQueue('shareId', createEmptyQueue(), { path: ['folder'], file: testFile('a.txt') });
        }).toThrow('Wrong file or folder structure');
    });

    it('throws error when adding the same file again', () => {
        const queue = createEmptyQueue();
        addItemToQueue('shareId', queue, { path: [], file: testFile('a.txt') });
        expect(() => {
            addItemToQueue('shareId', queue, { path: [], file: testFile('a.txt') });
        }).toThrow('File or folder "a.txt" is already uploading');
        addItemToQueue('shareId', queue, { path: [], folder: 'folder' });
        addItemToQueue('shareId', queue, { path: ['folder'], file: testFile('a.txt') });
        expect(() => {
            addItemToQueue('shareId', queue, { path: ['folder'], file: testFile('a.txt') });
        }).toThrow('File or folder "a.txt" is already uploading');
    });

    it('throws error when adding the same folder again', () => {
        const queue = createEmptyQueue();
        addItemToQueue('shareId', queue, { path: [], folder: 'folder' });
        expect(() => {
            addItemToQueue('shareId', queue, { path: [], folder: 'folder' });
        }).toThrow('File or folder "folder" is already uploading');
        addItemToQueue('shareId', queue, { path: ['folder'], folder: 'subfolder' });
        expect(() => {
            addItemToQueue('shareId', queue, { path: ['folder'], folder: 'subfolder' });
        }).toThrow('File or folder "subfolder" is already uploading');
    });
});
