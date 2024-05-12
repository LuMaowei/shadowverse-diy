import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { DrawerForm, ProFormText } from '@ant-design/pro-components';
import { Button, ColorPicker, Form } from 'antd';
import { useRef, useState } from 'react';

export default function Role() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<DB.Role>();
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formReadOnly, setFormReadOnly] = useState<boolean>(false);

  const onCreateFinish = (values: DB.Role) => {
    const { roleColor, ...rest } = values;
    window.Context.sqlClient.setRole({
      ...rest,
      // @ts-ignore
      roleColor: roleColor?.toHexString(),
    });
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
      width: 4,
    },
    {
      title: '职业名称',
      dataIndex: 'roleKeyword',
      copyable: true,
      ellipsis: tru,
    },
    {
      title: '代表颜色',
      dataIndex: 'roleColor',
      valueType: 'color',
      search: false,
      width: 8,
    },
    {
      title: '图标',
      dataIndex: 'roleIcon',
      width: 4,
    },
    {
      title: '头像',
      dataIndex: 'roleAvatar',
      width: 4,
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
        <Button
          key="delete"
          danger
          type="text"
          onClick={() => onDelete(record.id)}
        >
          删除
        </Button,
      ,
    ,
  ];

  return (
    <ProTable<DB.Role>
      columns={columns}
      actionRef={actionRef}
      request={async (params, sort, filter) => {
        console.log(params);
        return window.Context.sqlClient.getRoles(params);
      }}
      options={false}
      rowKey="id"
      search={{
        'auto',
      }}
      pagination={{
        10,
      }}
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
            minWidth: 300
          }}
          autoFocusFirstInput
          drawerProps={{
            destroyOnClose: true
          }}
          onFinish={async (values) => {
            onCreateFinish(values);
            return true;
          }}
        >
          <ProFormText name="id" hidden />
          <ProFormText name="roleKeyword" label="职业关键字" />
          <ProFormText
            rules={[
              {
                required: true
              }
            ]}
            name="roleName"
            label="职业名称"
          />
          <Form.Item name="roleColor" label="代表颜色">
            <ColorPicker disabledAlpha disabled={formReadOnly} />
          </Form.Item>
        </DrawerForm>
      ]}
    />
  )
}
