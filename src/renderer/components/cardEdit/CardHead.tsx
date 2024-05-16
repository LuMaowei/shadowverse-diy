import { Flex } from 'antd';

export default function CardHead() {
  return (
    <div className="card-head">
      <Flex align="center" gap={8}>
        <div>职业</div>
        <img src={roleEmblem} alt="职业徽章" />
        <div>{roleInfo.label}</div>
      </Flex>
      <Flex align="center" gap={8}>
        <div>类型</div>
        <div className="w-[30px]" />
        <div>{traitInfo.label}</div>
      </Flex>
    </div>
  );
}
