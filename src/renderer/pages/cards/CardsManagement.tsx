import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm } from 'antd';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classesMap from '../../config/classes';
import { RaritiesEnum, TypesEnum } from '../../config/types';

// 卡片
export default function CardsManagement() {
  const actionRef = useRef<ActionType>();

  const navigator = useNavigate();

  const onDelete = (id: DB.Cards['id']) => {
    window.Context.sqlClient.deleteCard({ id });
    actionRef.current?.reload();
  };

  const columns: ProColumns<DB.Cards>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '卡包',
      dataIndex: 'cardPackName',
      search: false,
    },
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '职业',
      dataIndex: 'classes',
      render: (text) => classesMap[text as string].name,
      search: false,
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (text) => TypesEnum[text as string],
      search: false,
    },
    {
      title: '稀有度',
      dataIndex: 'rarity',
      render: (text) => RaritiesEnum[text as string],
      search: false,
    },
    {
      title: '兵种',
      dataIndex: 'traitNameList',
      search: false,
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
            navigator(`/cards/edit/${record.id}`);
          }}
        >
          编辑
        </Button>,
        <Button
          key="view"
          type="text"
          onClick={() => {
            navigator(`/cards/edit/${record.id}`);
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
    <ProTable<DB.Cards>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const res = await window.Context.sqlClient.getCards(
          params as DB.Cards & { traitIds?: number[] },
        );
        return { success: true, data: res };
      }}
      options={false}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      dateFormatter="string"
      toolBarRender={() => [
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            navigator('/cards/edit');
          }}
        >
          新建
        </Button>,
      ]}
    />
  );
}
