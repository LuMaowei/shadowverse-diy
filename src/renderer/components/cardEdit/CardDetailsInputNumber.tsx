import { InputNumber } from 'antd';
import { useState } from 'react';

export default function CardDetailsInputNumber(props: {
  value?: number | null;
  onChange?: (value: number | null) => void;
}) {
  const { value, onChange } = props;
  const [disabled, setDisabled] = useState(true);

  if (disabled) {
    return <div onClick={() => setDisabled(false)}>{value}</div>;
  }

  return (
    <InputNumber
      autoFocus
      precision={0}
      min={0}
      max={99}
      value={value}
      onChange={onChange}
      onPressEnter={() => {
        setDisabled(true);
      }}
      onBlur={() => setDisabled(true)}
    />
  );
}
