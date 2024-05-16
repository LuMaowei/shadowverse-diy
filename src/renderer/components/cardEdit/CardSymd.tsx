import zero from 'assets/resources/cardSymd/0.png';
import one from 'assets/resources/cardSymd/1.png';
import two from 'assets/resources/cardSymd/2.png';
import three from 'assets/resources/cardSymd/3.png';
import four from 'assets/resources/cardSymd/4.png';
import five from 'assets/resources/cardSymd/5.png';
import six from 'assets/resources/cardSymd/6.png';
import seven from 'assets/resources/cardSymd/7.png';
import eight from 'assets/resources/cardSymd/8.png';
import nine from 'assets/resources/cardSymd/9.png';
import { InputNumber } from 'antd';
import { useState } from 'react';

const numberImages = [
  zero,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine,
];

function getNumberImagePath(number: number) {
  // 确保数字在0-99的范围内
  if (number < 0 || number > 99) {
    throw new Error('Number out of range');
  }

  // 将数字转化为字符串
  const numberStr = number.toString();

  // 根据数字的每一位返回对应的图片路径
  return numberStr.split('').map((digit: string, index: number) => ({
    key: index,
    path: numberImages[parseInt(digit, 10)],
  }));
}

export default function CardSymd(props: {
  value?: number;
  onChange?: (value: number | null) => void;
}) {
  const { value, onChange } = props;
  const numberImagePath = getNumberImagePath(value || 0);
  const [disabled, setDisabled] = useState(true);

  if (disabled) {
    return (
      <div
        className="card-frame-number-content"
        onClick={() => setDisabled(false)}
      >
        {numberImagePath.map((item) => (
          <img
            className="mx-[-8px]"
            width={56}
            height={56}
            key={item.key}
            src={item.path}
            alt=""
          />
        ))}
      </div>
    );
  }

  return (
    <div className="card-frame-number-content">
      <InputNumber
        autoFocus
        precision={0}
        min={0}
        max={99}
        value={value}
        onChange={onChange}
        onPressEnter={() => setDisabled(true)}
        onBlur={() => setDisabled(true)}
      />
    </div>
  );
}
