import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormDigit,
  ProTable,
  DrawerForm,
  ProFormText,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { Button, Form, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SingleImageUpload from '../../components/SingleImageUpload';
import DataTableSelect from '../../components/DataTableSelect';

// 卡片
export default function CardsManagement() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<DB.Card>();
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formReadOnly, setFormReadOnly] = useState<boolean>(false);

  const navigator = useNavigate();

  const onCreateFinish = (values: DB.Card) => {
    const { isToken, isReborn, ...rest } = values;
    window.Context.sqlClient.setCard({
      ...rest,
      isToken: Number(isToken),
      isReborn: Number(isReborn),
    });
    actionRef.current?.reload();
  };

  const onDelete = (id: DB.Card['id']) => {
    window.Context.sqlClient.deleteCard({ id });
    actionRef.current?.reload();
  };

  const columns: ProColumns<DB.Card>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '所属职业',
      dataIndex: 'roleName',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'typeLabel',
      ellipsis: true,
    },
    {
      title: '兵种',
      dataIndex: 'traitLabel',
      ellipsis: true,
    },
    {
      title: '稀有度',
      dataIndex: 'rarityLabel',
      ellipsis: true,
    },
    {
      title: '所属卡包',
      dataIndex: 'cardPackLabel',
      ellipsis: true,
    },
    {
      title: '消费',
      dataIndex: 'cost',
      ellipsis: true,
    },
    {
      title: '特殊卡',
      dataIndex: 'isToken',
      ellipsis: true,
    },
    {
      title: '图片',
      dataIndex: 'image',
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
            navigator(`/card/edit/${record.id}`);
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
    <ProTable<DB.Card>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        return window.Context.sqlClient.getCards(params);
      }}
      options={false}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      dateFormatter="string"
      toolBarRender={() => [
        <DrawerForm<DB.Card>
          open={formOpen}
          onOpenChange={setFormOpen}
          title={`${formReadOnly ? '查看' : '编辑'}卡片`}
          form={form}
          readonly={formReadOnly}
          trigger={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setFormReadOnly(false);
                navigator('/card/edit');
              }}
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
          <Form.Item name="roleId" label="所属职业">
            <DataTableSelect dataTable="role" />
          </Form.Item>
          <Form.Item name="typeId" label="类型">
            <DataTableSelect dataTable="type" />
          </Form.Item>
          <Form.Item name="traitId" label="兵种">
            <DataTableSelect dataTable="trait" />
          </Form.Item>
          <Form.Item name="rarityId" label="稀有度">
            <DataTableSelect dataTable="rarity" />
          </Form.Item>
          <Form.Item name="cardPackId" label="所属卡包">
            <DataTableSelect dataTable="cardPack" />
          </Form.Item>
          <ProFormText name="name" label="名称" />
          <ProFormDigit
            name="sort"
            label="排序"
            min={1}
            fieldProps={{ precision: 0 }}
          />
          <ProFormDigit
            name="cost"
            label="消费"
            min={1}
            fieldProps={{ precision: 0 }}
          />
          <ProFormSwitch name="isToken" label="是否为特殊卡" />
          <ProFormSwitch name="isReborn" label="是否为复苏卡" />
          <Form.Item name="image" label="图片">
            <SingleImageUpload disabled={formReadOnly} />
          </Form.Item>
        </DrawerForm>,
      ]}
    />
  );
}
