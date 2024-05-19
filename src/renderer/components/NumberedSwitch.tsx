import React from 'react';
import { Switch, SwitchProps } from 'antd';

export default function NumberedSwitch(
  props: SwitchProps & {
    value?: number;
    onChange?: (value: number | null) => void;
  },
) {
  const { value, onChange, ...rest } = props;
  return (
    <Switch
      {...rest}
      value={Boolean(value)}
      onChange={(checked) => onChange?.(Number(checked))}
    />
  );
}
