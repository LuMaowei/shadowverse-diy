import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, DrawerForm, ProFormText } from '@ant-design/pro-components';
import { Button, Form, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import SingleImageUpload from '../../components/SingleImageUpload';

// 卡片类型
export default function Type() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<DB.Role>();
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formReadOnly, setFormReadOnly] = useState<boolean>(false);

  const onCreateFinish = (values: DB.Role) => {
    window.Context.sqlClient.setRole(values);
    actionRef.current?.reload();
  };

  const onDelete = (id: DB.Role['id']) => {
    window.Context.sqlClient.deleteRole({ id });
    actionRef.current?.reload();
  };

  const columns: ProColumns<DB.Role>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '职业关键字',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '职业展示名称',
      dataIndex: 'label',
      ellipsis: true,
    },
    {
      title: '水晶',
      dataIndex: 'gem',
      search: false,
      valueType: 'image',
      align: 'center',
    },
    {
      title: '头像',
      dataIndex: 'checkIcon',
      search: false,
      valueType: 'image',
      align: 'center',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      align: 'center',
      width: 212,
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
        <Popconfirm
          title="你确定要删除此职业吗？"
          onConfirm={() => onDelete(record.id)}
        >
          <Button key="delete" danger type="text">
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <ProTable<DB.Role>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        return window.Context.sqlClient.getRoles(params);
      }}
      options={false}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      dateFormatter="string"
      toolBarRender={() => [
        <DrawerForm<DB.Role>
          open={formOpen}
          onOpenChange={setFormOpen}
          title="新建职业"
          form={form}
          readonly={formReadOnly}
          trigger={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setFormReadOnly(false)}
            >
              新建
            </Button>
          }
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
          <ProFormText name="name" label="职业关键字" />
          <ProFormText name="label" label="职业展示名称" />
          <Form.Item name="checkIcon" label="头像">
            <SingleImageUpload disabled={formReadOnly} />
          </Form.Item>
          <Form.Item name="gem" label="水晶">
            <SingleImageUpload disabled={formReadOnly} />
          </Form.Item>
          <Form.Item name="emblem" label="徽章">
            <SingleImageUpload disabled={formReadOnly} />
          </Form.Item>
          <Form.Item name="cardBackground" label="卡片背景">
            <SingleImageUpload disabled={formReadOnly} />
          </Form.Item>
        </DrawerForm>,
      ]}
    />
  );
}
