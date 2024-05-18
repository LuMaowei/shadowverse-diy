import { Form, Select } from 'antd';
import CardSymd from './CardSymd';
import CardFrameInput from './CardFrameInput';
import CardImageUpload from './CardImageUpload';
import {
  RaritiesEnum,
  raritiesList,
  TypesEnum,
  typesList,
} from '../../config/types';

export default function CardFrame(props: { frame?: string; gem?: string }) {
  const { frame, gem } = props;
  const formInstance = Form.useFormInstance();
  const type = Form.useWatch('type', formInstance);

  return (
    <div className="card-frame-container">
      <Form.Item noStyle name="rarity">
        <Select
          className="card-frame-select top-[16px] left-[144px]"
          variant="borderless"
          options={raritiesList.map((item) => ({
            value: item,
            label: RaritiesEnum[item],
          }))}
        />
      </Form.Item>
      <Form.Item noStyle name="type">
        <Select
          className="card-frame-select bottom-[44px] left-[144px]"
          variant="borderless"
          options={typesList.map((item) => ({
            value: item,
            label: TypesEnum[item],
          }))}
        />
      </Form.Item>
      <img className="card-frame-background" src={frame} alt="" />
      <img className="absolute left-[180px] bottom-[44px]" src={gem} alt="" />
      <div className="absolute w-[290px] h-[363px] top-[81px] left-[47px]">
        <Form.Item noStyle name="image">
          <CardImageUpload />
        </Form.Item>
      </div>
      <div className="card-frame-name-container top-[46px] left-[58px]">
        <Form.Item noStyle name="name">
          <CardFrameInput />
        </Form.Item>
      </div>
      <div className="card-frame-number-container top-[16px] left-[-8px]">
        <Form.Item noStyle name="cost">
          <CardSymd />
        </Form.Item>
      </div>
      {type === 'follower' && (
        <>
          <div className="card-frame-number-container left-[-8px] bottom-0">
            <Form.Item noStyle name="unevolvedAttack">
              <CardSymd />
            </Form.Item>
          </div>
          <div className="card-frame-number-container right-0 bottom-0">
            <Form.Item noStyle name="unevolvedHealth">
              <CardSymd />
            </Form.Item>
          </div>
        </>
      )}
    </div>
  );
}
