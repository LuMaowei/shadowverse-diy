import { Form } from 'antd';
import CardDetailsInputNumber from './CardDetailsInputNumber';
import CardDetailsTextArea from './CardDetailsTextArea';

export default function CardDescription() {
  return (
    <div className="card-description-container">
      <div className="card-description-follower-attr">
        <div>进化前</div>
        <div className="card-details-attr right-[138px]">
          <Form.Item noStyle name="unevolvedAttack" initialValue={0}>
            <CardDetailsInputNumber />
          </Form.Item>
        </div>
        <div className="card-details-attr right-[42px]">
          <Form.Item noStyle name="unevolvedHealth" initialValue={0}>
            <CardDetailsInputNumber />
          </Form.Item>
        </div>
      </div>
      <div className="crad-details-follower-unevolved">
        <Form.Item noStyle name="unevolvedDescription">
          <CardDetailsTextArea />
        </Form.Item>
      </div>
      <div className="card-description-follower-attr !top-[230px]">
        <div>进化后</div>
        <div className="card-details-attr right-[138px]">
          <Form.Item noStyle name="evolvedAttack" initialValue={0}>
            <CardDetailsInputNumber />
          </Form.Item>
        </div>
        <div className="card-details-attr right-[42px]">
          <Form.Item noStyle name="evolvedHealth" initialValue={0}>
            <CardDetailsInputNumber />
          </Form.Item>
        </div>
      </div>
      <div className="crad-details-follower-unevolved crad-details-follower-evolved">
        <Form.Item noStyle name="evolvedDescription">
          <CardDetailsTextArea />
        </Form.Item>
      </div>
    </div>
  );
}
