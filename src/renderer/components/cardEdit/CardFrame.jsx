import { useEffect, useState } from 'react';
import CardSymd from './CardSymd';
import CardFrameInput from './CardFrameInput';
import CardImageUpload from './CardImageUpload';

export default function CardFrame(props) {
  const { cardFrame, roleGem, name, cost, attack, health, image } = props;
  const [nameValue, setNameValue] = useState('');
  const [costValue, setCostValue] = useState(0);
  const [attackValue, setAttackValue] = useState(0);
  const [healthValue, setHealthValue] = useState(0);
  const [imageValue, setImageValue] = useState('');

  useEffect(() => {
    setNameValue(name || '');
    setCostValue(cost || 12);
    setAttackValue(attack || 89);
    setHealthValue(health || 12);
    setImageValue(image);
  }, [name, cost, attack, health, image]);

  const onFrameBackgroundClick = () => {};

  return (
    <div className="card-frame-container">
      <img
        className="card-frame-background"
        src={cardFrame}
        alt="卡片框架"
        onClick={onFrameBackgroundClick}
      />
      <img
        className="absolute left-[180px] bottom-[44px]"
        src={roleGem}
        alt="职业水晶"
      />
      <div className="absolute w-[290px] h-[363px] top-[81px] left-[47px]">
        <CardImageUpload value={imageValue} onChange={setImageValue} />
      </div>
      <div className="card-frame-name-container top-[46px] left-[58px]">
        <CardFrameInput value={nameValue} onChange={setNameValue} />
      </div>
      <div className="card-frame-number-container top-[16px] left-[-8px]">
        <CardSymd value={costValue} onChange={setCostValue} />
      </div>
      <div className="card-frame-number-container left-[-8px] bottom-0">
        <CardSymd value={attackValue} onChange={setAttackValue} />
      </div>
      <div className="card-frame-number-container right-0 bottom-0">
        <CardSymd value={healthValue} onChange={setHealthValue} />
      </div>
    </div>
  );
}
