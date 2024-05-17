import { Flex, Form, InputNumber, Select } from 'antd';
import DataTableSelect from '../DataTableSelect';
import classesMap, { classesList } from '../../config/classes';
import {
  RaritiesEnum,
  raritiesList,
  TypesEnum,
  typesList,
} from '../../config/types';

export default function CardHead(props: { emblem: string }) {
  const { emblem } = props;
  return (
    <div className="card-head">
      <Form.Item noStyle name="rarity">
        <Select
          className="card-head-select min-w-[96px]"
          variant="borderless"
          options={raritiesList.map((item) => ({
            value: item,
            label: RaritiesEnum[item],
          }))}
        />
      </Form.Item>
      <Form.Item noStyle name="type">
        <Select
          className="card-head-select min-w-[96px]"
          variant="borderless"
          options={typesList.map((item) => ({
            value: item,
            label: TypesEnum[item],
          }))}
        />
      </Form.Item>
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
