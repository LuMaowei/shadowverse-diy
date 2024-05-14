import { Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { v4 } from 'uuid';

const handleFileList = (filePath: string) => {
  const file = {
    uid: '-1',
    name: '-',
    status: 'done',
    url: filePath,
  };
  return [file as UploadFile];
};

export default function SingleImageUpload(
  props: UploadProps & { value?: string; onChange?: (value: string) => void },
) {
  const { value, onChange } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [eventId] = useState(v4());

  useEffect(() => {
    window.electron.ipcRenderer.on(
      `selected-file-${eventId}`,
      ({ filePaths }: { filePaths: string[] }) => {
        if (typeof onChange === 'function') {
          onChange(filePaths[0]);
        } else {
          setFileList(handleFileList(filePaths[0]));
        }
      },
    );
  }, []);

  useEffect(() => {
    if (value) {
      setFileList(handleFileList(value));
    } else {
      setFileList([]);
    }
  }, [value]);

  const onRemove = () => {
    if (typeof onChange === 'function') {
      onChange('');
    } else {
      setFileList([]);
    }
    return false;
  };

  return (
    <Upload
      {...props}
      maxCount={1}
      openFileDialogOnClick={false}
      listType="picture-card"
      fileList={fileList}
      onRemove={onRemove}
    >
      {!value && (
        <div
          className="flex justify-center items-center w-full h-full"
          onClick={() => {
            window.electron.ipcRenderer.sendMessage(
              'open-file-dialog',
              eventId,
            );
          }}
        >
          <PlusOutlined />
        </div>
      )}
    </Upload>
  );
}
