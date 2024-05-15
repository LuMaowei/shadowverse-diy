import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { DrawerForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, Form } from 'antd';
import { useRef, useState } from 'react';
import SingleImageUpload from '../../components/SingleImageUpload';

// 卡片类型
export default function Frame() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<DB.Frame>();
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formReadOnly, setFormReadOnly] = useState<boolean>(false);

  const onCreateFinish = (values: DB.Frame) => {
    window.Context.sqlClient.setFrame(values);
    actionRef.current?.reload();
  };

  const columns: ProColumns<DB.Frame>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '卡片类型',
      dataIndex: 'typeLabel',
      ellipsis: true,
    },
    {
      title: '稀有度',
      dataIndex: 'rarityLabel',
      ellipsis: true,
    },
    {
      title: '框架图片',
      dataIndex: 'frame',
      search: false,
      valueType: 'image',
      align: 'center',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      align: 'center',
      width: 152,
      render: (text, record) => [
        <Button
          key="edit"
          type="text"
          onClick={() => {
            form.setFieldsValue(record);
            setFormReadOnly(false);
            setFormOpen(true);
          }}
        >
          编辑
        </Button>,
        <Button
          key="view"
          type="text"
          onClick={() => {
            form.setFieldsValue(record);
            setFormReadOnly(true);
            setFormOpen(true);
          }}
        >
          查看
        </Button>,
      ],
    },
  ];

  return (
    <ProTable<DB.Frame>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        return window.Context.sqlClient.getFrames(params);
      }}
      options={false}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      dateFormatter="string"
      toolBarRender={() => [
        <DrawerForm<DB.Frame>
          open={formOpen}
          onOpenChange={setFormOpen}
          title={`${formReadOnly ? '查看' : '编辑'}卡片框架`}
          form={form}
          readonly={formReadOnly}
          resize={{
            maxWidth: window.innerWidth * 0.8,
            minWidth: 300,
          }}
          autoFocusFirstInput
          drawerProps={{
            destroyOnClose: true,
          }}
          onFinish={async (values) => {
            onCreateFinish(values);
            return true;
          }}
        >
          <ProFormText name="id" hidden />
          <ProFormText name="typeId" hidden />
          <ProFormText name="rarityId" hidden />
          <Form.Item name="frame" label="框架图片">
            <SingleImageUpload disabled={formReadOnly} />
          </Form.Item>
        </DrawerForm>,
      ]}
    />
  );
}
