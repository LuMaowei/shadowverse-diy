import { Flex, Form, Select } from 'antd';
import DataTableSelect from '../DataTableSelect';
import classesMap, { classesList } from '../../config/classes';

export default function CardHead(props: { emblem?: string }) {
  const { emblem } = props;
  return (
    <div className="card-head">
      <Flex align="center" gap={8}>
        <div>职业</div>
        <img src={emblem} alt="" />
        <Form.Item noStyle name="classes">
          <Select
            className="card-head-select min-w-[96px]"
            variant="borderless"
            options={classesList.map((item) => ({
              value: item,
              label: classesMap[item].name,
            }))}
          />
        </Form.Item>
      </Flex>
      <Flex align="center" gap={8}>
        <div>类型</div>
        <div className="w-[30px]" />
        <Form.Item noStyle name="traitIds">
          <DataTableSelect
            className="card-head-select min-w-[96px]"
            allowClear={false}
            dataTable="trait"
            variant="borderless"
            mode="multiple"
            maxCount={2}
          />
        </Form.Item>
      </Flex>
    </div>
  );
}
