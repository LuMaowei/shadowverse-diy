import { JSX, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Affix,
  Button,
  Flex,
  Form,
  InputNumber,
  message,
  theme,
  Tooltip,
} from 'antd';
import { domToPng } from 'modern-screenshot';
import { InfoCircleOutlined } from '@ant-design/icons';
import CardFrame from '../../components/cardEdit/CardFrame';
import CardDescription from '../../components/cardEdit/CardDescription';
import CardHead from '../../components/cardEdit/CardHead';
import classesMap from '../../config/classes';
import framesMap from '../../config/types';
import CardFooter from '../../components/cardEdit/CardFooter';
import DataTableSelect from '../../components/DataTableSelect';
import NumberedSwitch from '../../components/NumberedSwitch';
import autofit, {
  elRectification,
  getCurrentScale,
  keepFit,
  restoreScale,
} from '../../utils/autofit';
import originalSize from '../../config/size';

const elId = 'sv-card';

export default function CardEdit(): JSX.Element {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [scale, setScale] = useState(1);
  const navigate = useNavigate();
  const classes = Form.useWatch('classes', form);
  const type = Form.useWatch('type', form);
  const rarity = Form.useWatch('rarity', form);
  const isToken = Form.useWatch('isToken', form);
  const name = Form.useWatch('name', form);
  const holderRef = useRef<HTMLDivElement>(null);
  const svCardRef = useRef<HTMLDivElement>(null);
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();

  const { frame } = framesMap[`${type}_${rarity}`] || {};
  const { gem, emblem, background } = classesMap[classes] || {};

  useEffect(() => {
    autofit.init({
      el: `#${elId}`,
      dw: originalSize.width,
      dh: originalSize.height,
      resize: false,
    });
    return () => {
      autofit.off();
    };
  }, []);

  useEffect(() => {
    keepFit({
      dw: originalSize.width,
      dh: originalSize.height,
      dom: document.querySelector(`#${elId}`) as HTMLElement,
      ignore: [],
      limit: 0,
      currWidth: originalSize.width * scale,
      currHeight: originalSize.height * scale,
    });
    elRectification({
      el: '.card-details',
      isKeepRatio: false,
    });
  }, [scale]);

  const fetchCardInfo = () => {
    window.Context.sqlClient.getCard({ id: Number(id) }).then((res) => {
      const { cardDetails, ...rest } = res;
      const result: any = {};
      cardDetails?.forEach((item: any) => {
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
      form.setFieldsValue({
        ...rest,
        ...result,
        showIllustrator: !!rest.illustrator,
      });
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
        attack: unevolvedAttack || 0,
        health: unevolvedHealth || 0,
        description: unevolvedDescription,
        abilityIds: [],
      },
    ];
    if (typeValue === 'follower') {
      cardDetails.push({
        id: evolvedId,
        evolvedStage: 1,
        attack: evolvedAttack || 0,
        health: evolvedHealth || 0,
        description: evolvedDescription,
        abilityIds: [],
      });
    }
    const params = {
      ...rest,
      type: typeValue,
      cardDetails,
    };
    window.Context.sqlClient.setCard(params).then((res) => {
      navigate(`/cards/edit/${res}`, { replace: true });
    });
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
    messageApi
      .open({
        key: 'export',
        type: 'loading',
        content: '正在导出为图片...',
      })
      .then(() => {
        const currentScale = getCurrentScale();
        restoreScale(document.querySelector(`#${elId}`) as HTMLElement, true);
        domToPng(svCardRef.current!, {
          scale: currentScale,
        })
          .then((dataUrl) => {
            messageApi.open({
              key: 'export',
              type: 'success',
              content: '图片导出成功，请选择保存目录',
            });
            const link = document.createElement('a');
            link.download = `${name}.png`;
            link.href = dataUrl;
            link.click();
          })
          .finally(() => {
            restoreScale(
              document.querySelector(`#${elId}`) as HTMLElement,
              false,
            );
          });
      });
  };

  return (
    <div ref={holderRef} className="overflow-auto relative">
      {contextHolder}
      <Form
        form={form}
        initialValues={{
          classes: 'forest',
          type: 'follower',
          rarity: 'bronze',
        }}
      >
        <Affix target={() => holderRef.current}>
          <Flex
            className="p-2"
            style={{ background: token.colorBgContainer }}
            wrap
            gap={16}
          >
            <Form.Item hidden name="id">
              <InputNumber />
            </Form.Item>
            <Form.Item hidden name="unevolvedId">
              <InputNumber />
            </Form.Item>
            <Form.Item hidden name="evolvedId">
              <InputNumber />
            </Form.Item>
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
                  handleOptions={(cards) =>
                    cards.filter((item) => `${item.id}` !== `${id}`)
                  }
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
            <Button
              onClick={onExport}
              icon={
                <Tooltip title="导出过程中会将卡片缩放至原始大小，为正常现象，导出结束后会还原，图像清晰度不受此影响">
                  <InfoCircleOutlined />
                </Tooltip>
              }
            >
              导出
            </Button>
          </Flex>
        </Affix>
        <div
          id={elId}
          ref={svCardRef}
          className="card-container"
          style={{
            backgroundImage: `url(${background})`,
          }}
        >
          <div className="card-container-mask" />
          <CardHead emblem={emblem} />
          <div className="card-main-border" />
          <Flex className="card-content" justify="space-between" align="center">
            <CardFrame frame={frame} gem={gem} />
            <CardDescription scale={scale} onSizeChange={setScale} />
          </Flex>
          <CardFooter />
        </div>
      </Form>
    </div>
  );
}
