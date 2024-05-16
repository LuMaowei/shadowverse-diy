import { JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from 'antd';
import CardFrame from '../../components/cardEdit/CardFrame';
import CardDescription from '../../components/cardEdit/CardDescription';
import CardHead from '../../components/cardEdit/CardHead';

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
  const roleId = Form.useWatch('roleId', form);
  const rarityId = Form.useWatch('rarityId', form);
  const typeId = Form.useWatch('typeId', form);

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
        backgroundImage: `url("file://${roleBackground}")`,
      }}
    >
      <div className="card-container-mask" />
      <Form className="card-form" form={form}>
        <CardHead roleEmblem={roleEmblem} />
        <div className="card-main-border" />
        <div className="card-content">
          <CardFrame cardFrame={cardFrame} roleGem={roleGem} />
          <CardDescription />
        </div>
      </Form>
    </div>
  );
}
