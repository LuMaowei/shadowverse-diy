import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  DrawerForm,
  ProFormText,
  ProTable,
  ProFormTextArea,
  ProFormDigit,
} from '@ant-design/pro-components';
import { Button, Form, Popconfirm } from 'antd';
import { useRef, useState } from 'react';

// 能力
export default function Ability() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<DB.Ability>();
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formReadOnly, setFormReadOnly] = useState<boolean>(false);

  const onCreateFinish = (values: DB.Ability) => {
    window.Context.sqlClient.setAbility(values);
    actionRef.current?.reload();
  };

  const onDelete = (id: DB.Ability['id']) => {
    window.Context.sqlClient.deleteAbility({ id });
    actionRef.current?.reload();
  };

  const columns: ProColumns<DB.Ability>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '能力关键字',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '能力展示名称',
      dataIndex: 'label',
      ellipsis: true,
    },
    {
      title: '能力排序',
      dataIndex: 'sort',
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
          title="你确定要删除此能力吗？"
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
    <ProTable<DB.Ability>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        return window.Context.sqlClient.getAbilities(params);
      }}
      options={false}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      dateFormatter="string"
      toolBarRender={() => [
        <DrawerForm<DB.Ability>
          open={formOpen}
          onOpenChange={setFormOpen}
          title={`${formReadOnly ? '查看' : '编辑'}能力`}
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
          <ProFormText name="name" label="能力关键字" />
          <ProFormText name="label" label="能力展示名称" />
          <ProFormDigit
            name="sort"
            label="排序"
            min={1}
            fieldProps={{ precision: 0 }}
          />
          <ProFormTextArea name="description" label="能力描述" />
        </DrawerForm>,
      ]}
    />
  );
}
