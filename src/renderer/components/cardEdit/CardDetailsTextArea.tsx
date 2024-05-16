import { Input } from 'antd';
import { useState } from 'react';

export default function CardDetailsTextArea(props: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  const { value, onChange } = props;
  const [disabled, setDisabled] = useState(false);

  if (disabled) {
    return <div onClick={() => setDisabled(false)}>{value}</div>;
  }

  return (
    <Input.TextArea
      className="card-details-description-textarea"
      autoFocus
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      // onPressEnter={() => {
      //   setDisabled(true);
      // }}
      // onBlur={() => setDisabled(true)}
    />
  );
}
