import { Input } from 'antd';
import { useState } from 'react';

export default function CardFrameInput(props: {
  value: string;
  onChange: (value: string | null) => void;
}) {
  const { value, onChange } = props;
  const [disabled, setDisabled] = useState(true);

  if (disabled) {
    return (
      <div className="card-frame-name" onClick={() => setDisabled(false)}>
        {value}
      </div>
    );
  }

  return (
    <Input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPressEnter={() => {
        setDisabled(true);
      }}
      onBlur={() => setDisabled(true)}
    />
  );
}
