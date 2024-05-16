import { Flex, Form, InputNumber } from 'antd';
import DataTableSelect from '../DataTableSelect';

export default function CardHead(props) {
  const { roleEmblem } = props;
  return (
    <div className="card-head">
      <Form.Item hidden name="typeId">
        <InputNumber />
      </Form.Item>
      <Flex align="center" gap={8}>
        <div>职业</div>
        <img src={roleEmblem} alt="" />
        <Form.Item noStyle name="roleId">
          <DataTableSelect
            className="card-head-select min-w-[96px]"
            allowClear={false}
            dataTable="role"
            variant="borderless"
          />
        </Form.Item>
      </Flex>
      <Flex align="center" gap={8}>
        <div>类型</div>
        <div className="w-[30px]" />
        <Form.Item noStyle name="traitId">
          <DataTableSelect
            className="card-head-select min-w-[96px]"
            allowClear={false}
            dataTable="trait"
            variant="borderless"
          />
        </Form.Item>
      </Flex>
    </div>
  );
}
