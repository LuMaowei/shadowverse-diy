import { useEffect, useState } from 'react';
import CardDetailsInputNumber from './CardDetailsInputNumber';
import CardDetailsTextArea from './CardDetailsTextArea';

export default function CardDescription(props: { details: DB.CardDetails[] }) {
  const { details } = props;
  const [unevolvedAttack, setUnevolvedAttack] = useState<number | null>(0);
  const [unevolvedHealth, setUnevolvedHealth] = useState<number | null>(0);
  const [unevolvedDescription, setUnevolvedDescription] = useState<string>('');
  const [evolvedDescription, setEvolvedDescription] = useState<string | null>(
    '',
  );

  useEffect(() => {
    setUnevolvedAttack(details[0]?.attack || 12);
    setUnevolvedHealth(details[0]?.health || 34);
    setUnevolvedDescription(details[0]?.description || '测试文本');
    setEvolvedDescription(details[0]?.description || '测试文本');
  }, [details]);

  return (
    <div className="card-description-container">
      <div className="card-description-follower-attr">
        <div>进化前</div>
        <div className="card-details-attr right-[138px]">
          <CardDetailsInputNumber
            value={unevolvedAttack}
            onChange={setUnevolvedAttack}
          />
        </div>
        <div className="card-details-attr right-[42px]">
          <CardDetailsInputNumber
            value={unevolvedHealth}
            onChange={setUnevolvedHealth}
          />
        </div>
      </div>
      <div className="crad-details-follower-unevolved">
        <CardDetailsTextArea
          value={unevolvedDescription}
          onChange={setUnevolvedDescription}
        />
      </div>
      <div className="card-description-follower-attr !top-[230px]">
        <div>进化后</div>
        <div className="card-details-attr right-[138px]">
          <CardDetailsInputNumber
            value={unevolvedAttack}
            onChange={setUnevolvedAttack}
          />
        </div>
        <div className="card-details-attr right-[42px]">
          <CardDetailsInputNumber
            value={unevolvedHealth}
            onChange={setUnevolvedHealth}
          />
        </div>
      </div>
      <div className="crad-details-follower-unevolved crad-details-follower-evolved">
        2
      </div>
    </div>
  );
}
