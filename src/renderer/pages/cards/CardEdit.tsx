import { JSX, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Flex, Form, InputNumber, message } from 'antd';
import { domToPng } from 'modern-screenshot';
import CardFrame from '../../components/cardEdit/CardFrame';
import CardDescription from '../../components/cardEdit/CardDescription';
import CardHead from '../../components/cardEdit/CardHead';
import classesMap from '../../config/classes';
import framesMap from '../../config/types';
import CardFooter from '../../components/cardEdit/CardFooter';
import { originalSize } from '../../config/size';
import DataTableSelect from '../../components/DataTableSelect';
import NumberedSwitch from '../../components/NumberedSwitch';

export default function CardEdit(): JSX.Element {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [scale, setScale] = useState(1);
  const navigate = useNavigate();
  const classes = Form.useWatch('classes', form);
  const type = Form.useWatch('type', form);
  const rarity = Form.useWatch('rarity', form);
  const isToken = Form.useWatch('isToken', form);
  const svCardRef = useRef();

  const { frame } = framesMap[`${type}_${rarity}`] || {};
  const { key, name, avatar, gem, emblem, background } =
    classesMap[classes] || {};

  const fetchCardInfo = () => {
    window.Context.sqlClient.getCard({ id: Number(id) }).then((res) => {
      const { cardDetails, ...rest } = res;
      console.log(cardDetails);
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
      console.log({ ...rest, ...result });
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
    const params = {
      ...rest,
      type: typeValue,
      cardDetails,
    };
    console.log(params);
    window.Context.sqlClient.setCard(params);
    message.success('保存成功');
  };

  useEffect(() => {
    if (id) {
      fetchCardInfo();
    }
  }, [id]);

  const onBack = () => {
    navigate(-1);
  };

  const onExport = () => {
    domToPng(svCardRef.current).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'screenshot.png';
      link.href = dataUrl;
      link.click();
    });
  };

  return (
    <div>
      <Form
        form={form}
        initialValues={{
          classes: 'forest',
          type: 'follower',
          rarity: 'bronze',
        }}
      >
        <Flex id="toolbar" gap={16}>
          <Form.Item name="cardPackId" label="所属卡包">
            <DataTableSelect className="!w-[160px]" dataTable="cardPack" />
          </Form.Item>
          <Form.Item name="isReborn" label="复生卡">
            <NumberedSwitch />
          </Form.Item>
          <Form.Item name="isToken" label="特殊卡">
            <NumberedSwitch />
          </Form.Item>
          {isToken ? (
            <Form.Item name="parentIds" label="所属卡片">
              <DataTableSelect
                className="!w-[160px]"
                dataTable="card"
                mode="multiple"
              />
            </Form.Item>
          ) : null}
          <Form.Item name="showIllustrator" label="显示绘师">
            <NumberedSwitch />
          </Form.Item>
          <Button onClick={onBack}>取消</Button>
          <Button type="primary" onClick={saveCardInfo}>
            保存
          </Button>
          <Button onClick={onExport}>导出</Button>
        </Flex>
        <div
          ref={svCardRef}
          className="card-container"
          style={{
            backgroundImage: `url(${background})`,
            width: scale * originalSize.width,
            height: scale * originalSize.height,
            padding: `${scale * originalSize.paddingTop}px ${
              scale * originalSize.paddingX
            }px ${scale * originalSize.paddingBottom}px ${
              scale * originalSize.paddingX
            }px`,
          }}
        >
          <div className="card-container-mask" />
          <Form.Item name="id">
            <InputNumber />
          </Form.Item>
          <Form.Item name="unevolvedId">
            <InputNumber />
          </Form.Item>
          <Form.Item name="evolvedId">
            <InputNumber />
          </Form.Item>
          <CardHead emblem={emblem} scale={scale} />
          <div
            className="card-main-border"
            style={{
              height: scale * originalSize.mainBorderHeight,
              margin: `${
                2 * scale * originalSize.mainBorderMargin -
                originalSize.mainBorderMargin
              }px 0`,
            }}
          />
          <Flex className="card-content" justify="space-between" align="center">
            <CardFrame frame={frame} gem={gem} scale={scale} />
            <CardDescription scale={scale} onSizeChange={setScale} />
          </Flex>
          <CardFooter scale={scale} />
        </div>
      </Form>
    </div>
  );
}
