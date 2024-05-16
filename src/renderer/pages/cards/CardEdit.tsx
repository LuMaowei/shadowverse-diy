import { JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Flex, Form, Select } from 'antd';
import CardFrame from '../../components/cardEdit/CardFrame';
import CardDescription from '../../components/cardEdit/CardDescription';
import DataTableSelect from '../../components/DataTableSelect';

export default function CardEdit(): JSX.Element {
  const { id } = useParams();
  const [cardInfo, setCardInfo] = useState<DB.Card>({});
  const [cardDetails, setCardDetails] = useState<DB.CardDetails[]>([]);
  const [roleInfo, setRoleInfo] = useState<DB.Role>({});
  const [typeInfo, setTypeInfo] = useState<DB.Type>({});
  const [traitInfo, setTraitInfo] = useState<DB.Trait>({});
  const [rarityInfo, setRarityInfo] = useState<DB.Rarity>({});
  const [frameInfo, setFrameInfo] = useState<DB.Frame>({});
  const [form] = Form.useForm();

  const roleBackground = roleInfo.background?.replace(/\\/g, '\\\\');
  const roleGem = roleInfo.gem?.replace(/\\/g, '\\\\');
  const roleEmblem = roleInfo.emblem?.replace(/\\/g, '\\\\');
  const cardFrame = frameInfo.frame?.replace(/\\/g, '\\\\');

  const fetchCardInfo = () => {
    window.Context.sqlClient
      .getCards({ id: Number(id), pagination: false })
      .then((res) => {
        setCardInfo(res[0]);
      });

    window.Context.sqlClient
      .getCardDetails({
        cardId: Number(id),
        pagination: false,
      })
      .then((res) => {
        setCardDetails(res);
      });
  };

  useEffect(() => {
    if (id) {
      fetchCardInfo();
    }
  }, [id]);

  const fetchRelatedInfo = () => {
    window.Context.sqlClient
      .getRoles({ id: Number(cardInfo.roleId), pagination: false })
      .then((res) => {
        setRoleInfo(res[0]);
      });
    window.Context.sqlClient
      .getTypes({ id: Number(cardInfo.typeId), pagination: false })
      .then((res) => {
        setTypeInfo(res[0]);
      });
    window.Context.sqlClient
      .getTraits({ id: Number(cardInfo.traitId), pagination: false })
      .then((res) => {
        setTraitInfo(res[0]);
      });
    window.Context.sqlClient
      .getRarities({ id: Number(cardInfo.rarityId), pagination: false })
      .then((res) => {
        setRarityInfo(res[0]);
      });
    window.Context.sqlClient
      .getFrames({
        typeId: Number(cardInfo.typeId),
        rarityId: Number(cardInfo.rarityId),
        pagination: false,
      })
      .then((res) => {
        setFrameInfo(res[0]);
      });
  };

  useEffect(() => {
    if (cardInfo.id) {
      fetchRelatedInfo();
    }
  }, [cardInfo.id]);

  return (
    <div
      className="card-container"
      style={
        {
          // backgroundImage: `url("file://${roleBackground}")`,
        }
      }
    >
      <div className="card-container-mask" />
      <Form className="card-form" form={form}>
        <div className="card-head">
          <Flex align="center" gap={8}>
            <div>职业</div>
            <img src={roleEmblem} alt="职业徽章" />
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
        <div className="card-main-border" />
        <div className="card-content">
          <CardFrame
            cardFrame={cardFrame}
            roleGem={roleGem}
            name={cardInfo.name}
            cost={cardInfo.cost}
            attack={cardDetails[0]?.attack}
            health={cardDetails[0]?.health}
            image={cardInfo.image}
          />
          <CardDescription details={cardDetails} />
        </div>
      </Form>
    </div>
  );
}
