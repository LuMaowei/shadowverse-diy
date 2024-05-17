import { JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, InputNumber, Input } from 'antd';
import CardFrame from '../../components/cardEdit/CardFrame';
import CardDescription from '../../components/cardEdit/CardDescription';
import CardHead from '../../components/cardEdit/CardHead';
import classesMap from '../../config/classes';
import framesMap, { FramesMap } from '../../config/types';

function getFixedImagePath(imagePath: string): string {
  return imagePath.replace(/\\/g, '\\\\');
}

export default function CardEdit(): JSX.Element {
  const { id } = useParams();
  const [roleBackground, setRoleBackground] = useState<string>('');
  const [roleGem, setRoleGem] = useState<string>('');
  const [roleEmblem, setRoleEmblem] = useState<string>('');
  const [cardFrame, setCardFrame] = useState<string>('');
  const [form] = Form.useForm();
  const roleName = Form.useWatch('name', form);
  const roleId = Form.useWatch('roleId', form);
  const rarityId = Form.useWatch('rarityId', form);
  const typeId = Form.useWatch('typeId', form);

  const classes = Form.useWatch('classes', form);
  const type = Form.useWatch('type', form);
  const rarity = Form.useWatch('rarity', form);

  const { frame } = framesMap[`${type}_${rarity}`] || {};
  const { key, name, avatar, gem, emblem, background } =
    classesMap[classes] || {};

  const fetchFrameInfo = (params: { rarityId?: number; typeId?: number }) => {
    window.Context.sqlClient
      .getFrames({ ...params, pagination: false })
      .then((res) => {
        setCardFrame(getFixedImagePath(res[0].frame));
      });
  };

  const fetchRoleInfo = (params: { roleId?: number }) => {
    window.Context.sqlClient
      .getRoles({ ...params, pagination: false })
      .then((res) => {
        console.log(res);
        setRoleGem(getFixedImagePath(res[0].gem));
        setRoleBackground(getFixedImagePath(res[0].background));
        setRoleEmblem(getFixedImagePath(res[0].emblem));
      });
  };

  const fetchCardInfo = () => {
    window.Context.sqlClient.getCard({ id: Number(id) }).then((res) => {
      const {
        evolutionStages,
        attacks,
        healths,
        cardDetailsDescriptions,
        ...rest
      } = res;
      fetchFrameInfo({ rarityId: rest.rarityId, typeId: rest.typeId });
      const [unevolved, evolved] =
        evolutionStages?.split(',').map((item: any) => Number(item)) || [];
      const [unevolvedAttack, evolvedAttack] =
        attacks?.split(',').map((item: any) => Number(item)) || [];
      const [unevolvedHealth, evolvedHealth] =
        healths?.split(',').map((item: any) => Number(item)) || [];
      const [unevolvedDescription, evolvedDescription] =
        cardDetailsDescriptions?.split(',') || [];
      const cardDetails: {
        unevolved?: number;
        unevolvedAttack?: number;
        unevolvedHealth?: number;
        unevolvedDescription?: string;
        evolved?: number;
        evolvedAttack?: number;
        evolvedHealth?: number;
        evolvedDescription?: string;
      } = {};
      cardDetails.unevolved = unevolved;
      cardDetails.unevolvedAttack = unevolvedAttack;
      cardDetails.unevolvedHealth = unevolvedHealth;
      cardDetails.unevolvedDescription = unevolvedDescription;
      if (evolved) {
        cardDetails.evolved = evolved;
        cardDetails.evolvedAttack = evolvedAttack;
        cardDetails.evolvedHealth = evolvedHealth;
        cardDetails.evolvedDescription = evolvedDescription;
      }
      setRoleBackground(getFixedImagePath(rest.roleBackground));
      setRoleGem(getFixedImagePath(rest.roleGem));
      setRoleEmblem(getFixedImagePath(rest.roleEmblem));
      form.setFieldsValue({ ...rest, ...cardDetails });
    });
  };

  const saveCardInfo = () => {
    const values = form.getFieldsValue();
  };

  useEffect(() => {
    if (id) {
      fetchCardInfo();
    }
  }, [id]);

  useEffect(() => {
    if (roleId) {
      fetchRoleInfo({ roleId });
    }
  }, [roleId]);

  useEffect(() => {
    if (typeId && rarityId) {
      fetchFrameInfo({ typeId, rarityId });
    }
  }, [typeId, rarityId]);

  return (
    <div
      className="card-container"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="card-container-mask" />
      <Form className="card-form" form={form}>
        <Form.Item hidden name="typeId">
          <InputNumber />
        </Form.Item>
        <Form.Item hidden name="name">
          <Input />
        </Form.Item>
        <CardHead emblem={emblem} />
        <div className="card-main-border" />
        <div className="card-content">
          <CardFrame frame={frame} gem={gem} />
          <CardDescription />
        </div>
      </Form>
    </div>
  );
}
