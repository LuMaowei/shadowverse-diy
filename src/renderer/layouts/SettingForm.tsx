import { Form, Select, Space } from 'antd';
import { MoonFilled } from '@ant-design/icons';
import { useEffect } from 'react';

const darkOptions = [
  { label: '跟随系统', value: 'system' },
  { label: '禁用', value: 'light' },
  { label: '启用', value: 'dark' },
];

interface SettingFormValues {
  dark: string;
}

export default function SettingForm() {
  const [form] = Form.useForm();
  const dark = Form.useWatch('dark', form);

  useEffect(() => {
    form.setFieldsValue(window.Context.store.get('setting'));
  }, []);

  useEffect(() => {
    if (typeof dark === 'string') {
      window.electron.ipcRenderer.sendMessage('dark-mode:change', dark);
    }
  }, [dark]);

  const onValuesChange = (values: SettingFormValues) => {
    window.Context.store.set('setting', values);
  };

  return (
    <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
      <Form.Item
        name="dark"
        label={
          <Space>
            <MoonFilled />
            暗黑模式
          </Space>
        }
      >
        <Select options={darkOptions} />
      </Form.Item>
    </Form>
  );
}
