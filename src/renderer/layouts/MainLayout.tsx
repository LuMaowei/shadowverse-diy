import {
  BorderOutlined,
  CloseOutlined,
  MinusOutlined,
  MinusSquareOutlined,
  SettingFilled,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  ProConfigProvider,
  ProLayout,
} from '@ant-design/pro-components';
import { JSX, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button, Drawer, Space } from 'antd';
import menu from '../config/menu';
import SettingForm from './SettingForm';
import useDarkMode from '../hooks/useDarkMode';

export default function MainLayout(): JSX.Element {
  const { pathname } = useLocation();
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [settingDrawerOpen, setSettingDrawerOpen] = useState<boolean>(false);
  const darkMode = useDarkMode();

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

  const onSettingClick = () => {
    setSettingDrawerOpen(true);
  };

  return (
    <div className="min-h-screen">
      <ProConfigProvider dark={darkMode}>
        <ProLayout
          title="影之诗卡片DIY工具"
          logo={false}
          layout="mix"
          route={{
            path: '/',
            routes: menu,
          }}
          location={{
            pathname,
          }}
          menuItemRender={(item, dom) => (
            <Link to={item.path || ''}>{dom}</Link>
          )}
          breadcrumbRender={false}
          // @ts-ignore
          onItemClick={(appItem: { url: string }) => {
            window.electron.ipcRenderer.sendMessage('open-url', appItem.url);
          }}
          appList={[
            {
              icon: 'https://shadowverse-portal.com/public/assets/image/common/global/favicon/favicon.ico',
              title: '官方资料库',
              desc: '「Shadowverse」牌組的製作支援網站',
              url: 'https://shadowverse-portal.com/?lang=zh-tw',
            },
            {
              icon: 'https://shadowverse-wins.com/common/img/favicon.ico',
              title: '推特连胜总结',
              desc: 'シャドウバース連勝ツイートまとめサイトです',
              url: 'https://shadowverse-wins.com/',
            },
            {
              icon: 'https://shadowversemaster.com/favicon.svg',
              title: 'nga板块',
              desc: '活跃的影之诗主题论坛,资讯/攻略/即时交流',
              url: 'https://nga.178.com/thread.php?fid=-8180483&order_by=postdatedesc',
            },
            {
              icon: 'https://shadowversemaster.com/favicon.svg',
              title: 'Shadowverse Master',
              desc: ' 指定强度排行 - Shadowverse Master',
              url: 'https://shadowversemaster.com/meta',
            },

            {
              icon: 'https://shadowverse-unlimited.net/image/blue1.ico',
              title: 'shadowverse-unlimited',
              desc: 'アンリミテッド　環境デッキ - アンリミネット',
              url: 'https://shadowverse-unlimited.net/?%E3%82%A2%E3%83%B3%E3%83%AA%E3%83%9F%E3%83%86%E3%83%83%E3%83%89%E3%80%80%E7%92%B0%E5%A2%83%E3%83%87%E3%83%83%E3%82%AD',
            },
          ]}
          actionsRender={() => {
            return [
              <Button
                key="minimize"
                type="text"
                icon={<MinusOutlined />}
                onClick={() => onActionClick('minimize')}
              />,
              <Button
                key="maximize"
                type="text"
                icon={
                  isMaximized ? <MinusSquareOutlined /> : <BorderOutlined />
                }
                onClick={() => onActionClick('maximize')}
              />,
              <Button
                key="close"
                danger
                type="text"
                icon={<CloseOutlined />}
                onClick={() => onActionClick('close')}
              />,
            ];
          }}
          pageTitleRender={false}
          links={[
            <Space className="w-full" onClick={onSettingClick}>
              <SettingFilled />
              设置
            </Space>,
          ]}
        >
          <PageContainer>
            <ProCard className="min-h-[calc(100vh-160px)]">
              <Outlet />
            </ProCard>
          </PageContainer>
        </ProLayout>
        <Drawer
          forceRender
          open={settingDrawerOpen}
          title="设置"
          onClose={() => setSettingDrawerOpen(false)}
        >
          <SettingForm />
        </Drawer>
      </ProConfigProvider>
    </div>
  );
}
