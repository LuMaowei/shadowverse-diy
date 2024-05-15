import { useState } from 'react';

export default function CardFrame(props) {
  const { cardFrame, cost, attack, health } = props;
  const [costValue, setCostValue] = useState(cost);
  const [attackValue, setAttackValue] = useState(attack);
  const [healthValue, setHealthValue] = useState(health);

  return (
    <div className="card-frame-container">
      <img className="card-frame" src={cardFrame} alt="卡片框架" />
      <div className="absolute bg-black w-[104px] h-[104px] top-[72px] left-[32px] rounded-full">
        111
      </div>
    </div>
  );
}
