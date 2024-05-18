import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, Popconfirm } from 'antd';
import { useRef, useState } from 'react';

// 能力
export default function Ability() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<DB.Abilities>();
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const onCreateFinish = (values: DB.Abilities) => {
    window.Context.sqlClient.setAbility(values);
    actionRef.current?.reload();
  };

  const onDelete = (id: DB.Abilities['id']) => {
    window.Context.sqlClient.deleteAbility({ id });
    actionRef.current?.reload();
  };

  const columns: ProColumns<DB.Abilities>[] = [
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
      title: '能力排序',
      dataIndex: 'sort',
      align: 'center',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      align: 'center',
      width: 144,
      render: (text, record) => [
        <Button
          key="edit"
          type="text"
          onClick={() => {
            form.setFieldsValue(record);
            setFormOpen(true);
          }}
        >
          编辑
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
    <ProTable<DB.Abilities>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const res = await window.Context.sqlClient.getAbilities(
          params as DB.Abilities,
        );
        return { success: true, data: res };
      }}
      options={false}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      dateFormatter="string"
      toolBarRender={() => [
        <ModalForm<DB.Abilities>
          open={formOpen}
          onOpenChange={setFormOpen}
          title="编辑能力"
          form={form}
          trigger={
            <Button type="primary" icon={<PlusOutlined />}>
              新建
            </Button>
          }
          autoFocusFirstInput
          modalProps={{
            destroyOnClose: true,
          }}
          onFinish={async (values) => {
            onCreateFinish(values);
            return true;
          }}
        >
          <ProFormText name="id" hidden />
          <ProFormText name="name" label="能力关键字" />
          <ProFormDigit
            name="sort"
            label="排序"
            min={1}
            fieldProps={{ precision: 0 }}
          />
          <ProFormTextArea name="description" label="能力描述" />
        </ModalForm>,
      ]}
    />
  );
}
