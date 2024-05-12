import {
  BorderOutlined,
  CloseOutlined,
  MinusOutlined,
  MinusSquareOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard, ProLayout } from '@ant-design/pro-components';
import { JSX, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import menu from '../config/menu';

export default function MainLayout(): JSX.Element {
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

  return (
    <div className="min-h-screen">
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
        menuItemRender={(item, dom) => <Link to={item.path || ''}>{dom}</Link>}
        breadcrumbRender={false}
        bgLayoutImgList={[
          {
            src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
            left: 85,
            bottom: 100,
            height: '303px',
          },
          {
            src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
            bottom: -68,
            right: -45,
            height: '303px',
          },
          {
            src: 'https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png',
            bottom: 0,
            left: 0,
            width: '331px',
          },
        ]}
        appList={[
          {
            icon: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
            title: 'Ant Design',
            desc: '杭州市较知名的 UI 设计语言',
            url: 'https://ant.design',
          },
          {
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png',
            title: 'AntV',
            desc: '蚂蚁集团全新一代数据可视化解决方案',
            url: 'https://antv.vision/',
            target: '_blank',
          },
          {
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/upvrAjAPQX/Logo_Tech%252520UI.svg',
            title: 'Pro Components',
            desc: '专业级 UI 组件库',
            url: 'https://procomponents.ant.design/',
          },
          {
            icon: 'https://img.alicdn.com/tfs/TB1zomHwxv1gK0jSZFFXXb0sXXa-200-200.png',
            title: 'umi',
            desc: '插件化的企业级前端应用框架。',
            url: 'https://umijs.org/zh-CN/docs',
          },

          {
            icon: 'https://gw.alipayobjects.com/zos/bmw-prod/8a74c1d3-16f3-4719-be63-15e467a68a24/km0cv8vn_w500_h500.png',
            title: 'qiankun',
            desc: '可能是你见过最完善的微前端解决方案🧐',
            url: 'https://qiankun.umijs.org/',
          },
          {
            icon: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
            title: '语雀',
            desc: '知识创作与分享工具',
            url: 'https://www.yuque.com/',
          },
          {
            icon: 'https://gw.alipayobjects.com/zos/rmsportal/LFooOLwmxGLsltmUjTAP.svg',
            title: 'Kitchen ',
            desc: 'Sketch 工具集',
            url: 'https://kitchen.alipay.com/',
          },
          {
            icon: 'https://gw.alipayobjects.com/zos/bmw-prod/d3e3eb39-1cd7-4aa5-827c-877deced6b7e/lalxt4g3_w256_h256.png',
            title: 'dumi',
            desc: '为组件开发场景而生的文档工具',
            url: 'https://d.umijs.org/zh-CN',
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
              icon={isMaximized ? <MinusSquareOutlined /> : <BorderOutlined />}
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
      >
        <PageContainer>
          <ProCard className="min-h-[calc(100vh-160px)]">
            <Outlet />
          </ProCard>
        </PageContainer>
      </ProLayout>
    </div>
  );
}
