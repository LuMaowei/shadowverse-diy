import { Input } from 'antd';
import { useState } from 'react';

export default function IllustratorInput(props: {
  value?: string;
  onChange?: (value: string | null) => void;
}) {
  const { value, onChange } = props;
  const [disabled, setDisabled] = useState(true);

  if (disabled) {
    return <div onClick={() => setDisabled(false)}>绘师: {value}</div>;
  }

  return (
    <Input
      className="w-1/2 card-text"
      autoFocus
      variant="borderless"
      size="small"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onPressEnter={() => {
        setDisabled(true);
      }}
      onBlur={() => setDisabled(true)}
    />
  );
}
