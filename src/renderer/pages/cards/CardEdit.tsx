import { JSX, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Form, InputNumber } from 'antd';
import autofit from 'autofit.js';
import CardFrame from '../../components/cardEdit/CardFrame';
import CardDescription from '../../components/cardEdit/CardDescription';
import CardHead from '../../components/cardEdit/CardHead';
import classesMap from '../../config/classes';
import framesMap from '../../config/types';

export default function CardEdit(): JSX.Element {
  const { id } = useParams();
  const [form] = Form.useForm();

  useEffect(() => {
    autofit.init({
      el: 'card-edit',
      dw: 1270,
      dh: 715,
    });
  }, []);

  const classes = Form.useWatch('classes', form);
  const type = Form.useWatch('type', form);
  const rarity = Form.useWatch('rarity', form);

  const { frame } = framesMap[`${type}_${rarity}`] || {};
  const { key, name, avatar, gem, emblem, background } =
    classesMap[classes] || {};

  const fetchCardInfo = () => {
    window.Context.sqlClient.getCard({ id: Number(id) }).then((res) => {
      console.log(res);
      const { cardDetails, ...rest } = res;
      const result: any = {};
      cardDetails.forEach((item: any) => {
        if (item.evolvedStage === 0) {
          result.unevolvedId = item.id;
          result.unevolvedAttack = item.attack;
          result.unevolvedHealth = item.health;
          result.unevolvedDescription = item.description;
        } else if (item.evolvedStage === 1) {
          result.evolvedId = item.id;
          result.evolvedAttack = item.attack;
          result.evolvedHealth = item.health;
          result.evolvedDescription = item.description;
        }
      });
      form.setFieldsValue({ ...rest, ...result });
    });
  };

  const saveCardInfo = () => {
    const {
      type: typeValue,
      unevolvedId,
      unevolvedAttack,
      unevolvedHealth,
      evolvedId,
      evolvedAttack,
      evolvedHealth,
      unevolvedDescription,
      evolvedDescription,
      ...rest
    } = form.getFieldsValue();
    const cardDetails = [
      {
        id: unevolvedId,
        evolvedStage: 0,
        attack: unevolvedAttack,
        health: unevolvedHealth,
        description: unevolvedDescription,
        abilityIds: [],
      },
    ];
    if (typeValue === 'follower') {
      cardDetails.push({
        id: evolvedId,
        evolvedStage: 1,
        attack: evolvedAttack,
        health: evolvedHealth,
        description: evolvedDescription,
        abilityIds: [],
      });
    }
    const params = { ...rest, type: typeValue, cardDetails };
    console.log(params);
    window.Context.sqlClient.setCard(params);
  };

  useEffect(() => {
    if (id) {
      fetchCardInfo();
    }
  }, [id]);

  return (
    <div>
      <Button onClick={saveCardInfo}>保存</Button>
      <div
        id="card-edit"
        className="card-container"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="card-container-mask" />
        <Form className="card-form" form={form}>
          <Form.Item hidden name="id">
            <InputNumber />
          </Form.Item>
          <Form.Item hidden name="unevolvedId">
            <InputNumber />
          </Form.Item>
          <Form.Item hidden name="evolvedId">
            <InputNumber />
          </Form.Item>
          <CardHead emblem={emblem} />
          <div className="card-main-border" />
          <div className="card-content">
            <CardFrame frame={frame} gem={gem} />
            <CardDescription />
          </div>
        </Form>
      </div>
    </div>
  );
}
