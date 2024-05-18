import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, Form, Popconfirm } from 'antd';
import { useRef, useState } from 'react';

export default function Trait() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<DB.Traits>();
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const onCreateFinish = (values: DB.Traits) => {
    window.Context.sqlClient.setTrait(values);
    actionRef.current?.reload();
  };

  const onDelete = (id: DB.Traits['id']) => {
    window.Context.sqlClient.deleteTrait({ id });
    actionRef.current?.reload();
  };

  const columns: ProColumns<DB.Traits>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '兵种名称',
      dataIndex: 'name',
      ellipsis: true,
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
          title="你确定要删除此兵种吗？"
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
    <ProTable<DB.Traits>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const res = await window.Context.sqlClient.getTraits(
          params as DB.Traits,
        );
        return { success: true, data: res };
      }}
      options={false}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      dateFormatter="string"
      toolBarRender={() => [
        <ModalForm<DB.Traits>
          open={formOpen}
          onOpenChange={setFormOpen}
          title="编辑兵种"
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
          <ProFormText name="name" label="兵种名称" />
        </ModalForm>,
      ]}
    />
  );
}
