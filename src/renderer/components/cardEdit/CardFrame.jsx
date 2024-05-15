import { useEffect, useState } from 'react';
import CardSymd from './CardSymd';
import CardFrameInput from './CardFrameInput';

export default function CardFrame(props) {
  const { cardFrame, name, cost, attack, health } = props;
  const [nameValue, setNameValue] = useState('');
  const [costValue, setCostValue] = useState(0);
  const [attackValue, setAttackValue] = useState(0);
  const [healthValue, setHealthValue] = useState(0);

  useEffect(() => {
    setNameValue(name || '');
    setCostValue(cost || 12);
    setAttackValue(attack || 89);
    setHealthValue(health || 12);
  }, [name, cost, attack, health]);

  const onFrameBackgroundClick = () => {};

  return (
    <div className="card-frame-container">
      <img
        className="card-frame-background"
        src={cardFrame}
        alt="卡片框架"
        onClick={onFrameBackgroundClick}
      />
      <div className="card-frame-name-container top-[62px] left-[104px]">
        <CardFrameInput value={nameValue} onChange={setNameValue} />
      </div>
      <div className="card-frame-number-container top-[28px]">
        <CardSymd value={costValue} onChange={setCostValue} />
      </div>
      <div className="card-frame-number-container left-[8px] bottom-[16px]">
        <CardSymd value={attackValue} onChange={setAttackValue} />
      </div>
      <div className="card-frame-number-container right-[8px] bottom-[16px]">
        <CardSymd value={healthValue} onChange={setHealthValue} />
      </div>
    </div>
  );
}
