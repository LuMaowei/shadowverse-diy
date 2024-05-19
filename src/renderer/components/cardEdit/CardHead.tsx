import { Flex, Form, Select } from 'antd';
import DataTableSelect from '../DataTableSelect';
import classesMap, { classesList } from '../../config/classes';

export default function CardHead(props: { emblem?: string; scale: number }) {
  const { emblem, scale } = props;
  return (
    <Flex
      className="card-head"
      justify="end"
      gap={8}
      style={{ transform: `scale(${scale})` }}
    >
      <table>
        <tbody>
          <tr>
            <td>职业</td>
            <td>
              <img width={37} height={37} src={emblem} alt="" />
            </td>
            <td>
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
            </td>
          </tr>
          <tr>
            <td>类型</td>
            <td />
            <td>
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
            </td>
          </tr>
        </tbody>
      </table>
    </Flex>
  );
}
