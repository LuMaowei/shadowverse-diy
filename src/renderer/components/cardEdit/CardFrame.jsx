import { Form } from 'antd';
import CardSymd from './CardSymd';
import CardFrameInput from './CardFrameInput';
import CardImageUpload from './CardImageUpload';

export default function CardFrame(props) {
  const { cardFrame, roleGem } = props;

  return (
    <div className="card-frame-container">
      <img className="card-frame-background" src={cardFrame} alt="" />
      <img
        className="absolute left-[180px] bottom-[44px]"
        src={roleGem}
        alt=""
      />
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
      <div className="card-frame-number-container left-[-8px] bottom-0">
        <Form.Item noStyle name="attack">
          <CardSymd />
        </Form.Item>
      </div>
      <div className="card-frame-number-container right-0 bottom-0">
        <Form.Item noStyle name="health">
          <CardSymd />
        </Form.Item>
      </div>
    </div>
  );
}
