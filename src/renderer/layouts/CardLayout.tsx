import {
  BorderOutlined,
  CloseOutlined,
  MinusOutlined,
  MinusSquareOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard, ProLayout } from '@ant-design/pro-components';
import { JSX, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import menu from '../config/menu';

export default function CardLayout(): JSX.Element {
  const { pathname } = useLocation();
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    window.electron.ipcRenderer.on('isMaximized', (data: boolean) => {
      setIsMaximized(data);
    });
  }, []);

  const onActionClick = (action: string) => {
    let channel;
    switch (action) {
      case 'minimize':
        channel = 'window:minimize';
        break;
      case 'maximize':
        channel = 'window:maximize';
        break;
      case 'close':
        channel = 'window:close';
        break;
      default:
        break;
    }
    if (channel) {
      window.electron.ipcRenderer.sendMessage(channel);
    }
  };

  const navigator = useNavigate();

  return (
    <div className="min-h-screen">
      <header>
        <Button onClick={() => navigator('/')}>回到首页</Button>
      </header>
      <Outlet />
    </div>
  );
}
