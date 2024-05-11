import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Dropdown } from 'antd';
import { useRef } from 'react';

const columns: ProColumns<DB.Role>[] = [
  {
    dataIndex: 'index',
    valueType: 'indexBorder',
    width: 48,
  },
  {
    title: '职业名称',
    dataIndex: 'roleKeyword',
    copyable: true,
    ellipsis: true,
  },
  {
    title: '代表颜色',
    dataIndex: 'roleColor',
    width: 80,
  },
  {
    title: '图标',
    dataIndex: 'roleIcon',
    width: 48,
  },
  {
    title: '头像',
    dataIndex: 'roleAvatar',
    width: 48,
  },
  {
    title: '操作',
    valueType: 'option',
    key: 'option',
    align: 'center',
    width: 212,
    render: (text, record) => [
      <Button key="edit" type="text">
        编辑
      </Button>,
      <Button key="view" type="text">
        查看
      </Button>,
      <Button key="delete" danger type="text">
        删除
      </Button>,
    ],
  },
];

export default function Role() {
  const actionRef = useRef<ActionType>();
  return (
    <ProTable<DB.Role>
      columns={columns}
      actionRef={actionRef}
      request={async (params, sort, filter) => {
        console.log(params, sort, filter);
        window.Context.sqlClient.getRoles(params).then((res) => {
          console.log(res);
        });
        return window.Context.sqlClient.getRoles(params);
      }}
      options={false}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      pagination={{
        pageSize: 10,
      }}
      dateFormatter="string"
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          onClick={() => {
            actionRef.current?.reload();
          }}
          type="primary"
        >
          新建
        </Button>,
      ]}
    />
  );
}
