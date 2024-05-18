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
  const [form] = Form.useForm<DB.CardPacks>();
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const onCreateFinish = (values: DB.CardPacks) => {
    window.Context.sqlClient.setCardPack(values);
    actionRef.current?.reload();
  };

  const onDelete = (id: DB.CardPacks['id']) => {
    window.Context.sqlClient.deleteCardPack({ id });
    actionRef.current?.reload();
  };

  const columns: ProColumns<DB.CardPacks>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '卡包名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '卡包排序',
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
          title="你确定要删除此卡包吗？"
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
    <ProTable<DB.CardPacks>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const res = await window.Context.sqlClient.getCardPacks(
          params as DB.CardPacks,
        );
        return { success: true, data: res };
      }}
      options={false}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      dateFormatter="string"
      toolBarRender={() => [
        <ModalForm<DB.CardPacks>
          open={formOpen}
          onOpenChange={setFormOpen}
          title="编辑卡包"
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
          <ProFormText name="name" label="卡包名称" />
          <ProFormDigit
            name="sort"
            label="排序"
            min={1}
            fieldProps={{ precision: 0 }}
          />
          <ProFormTextArea name="description" label="卡包描述" />
        </ModalForm>,
      ]}
    />
  );
}
