import { Input } from 'antd';
import { useState } from 'react';

export default function CardFrameInput(props: {
  value?: string;
  onChange?: (value: string | null) => void;
  prefix?: string;
}) {
  const { value, onChange, prefix } = props;
  const [disabled, setDisabled] = useState(true);
  const fontSize = (value?.length || 0) <= 5 ? 32 : 40 - (value?.length || 0);

  if (disabled) {
    return (
      <div
        className="card-frame-name"
        style={{ fontSize }}
        onClick={() => setDisabled(false)}
      >
        {prefix ? `${prefix}: ` : ''}
        {value}
      </div>
    );
  }

  return (
    <Input
      className="card-text text-center"
      style={{ fontSize }}
      autoFocus
      variant="borderless"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onPressEnter={() => {
        setDisabled(true);
      }}
      onBlur={() => setDisabled(true)}
    />
  );
}
