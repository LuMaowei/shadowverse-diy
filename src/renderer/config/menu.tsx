import { Route } from '@ant-design/pro-layout/lib/typing';
import { CrownFilled, SmileFilled, TabletFilled } from '@ant-design/icons';

const menu: Route = [
  {
    path: '/',
    name: '欢迎',
    icon: <SmileFilled />,
  },
  {
    path: '/attributes',
    name: '属性管理',
    icon: <CrownFilled />,
    routes: [
      {
        index: true,
        path: 'role',
        name: '职业',
        icon: 'https://gw.alipayobjects.com/zos/antfincdn/upvrAjAPQX/Logo_Tech%252520UI.svg',
      },
      {
        path: 'type',
        name: '卡片种类',
        icon: <CrownFilled />,
      },
      {
        path: 'rarity',
        name: '稀有度',
        icon: <CrownFilled />,
      },
    ],
  },
  {
    name: '卡片管理',
    icon: <TabletFilled />,
    path: '/cards',
  },
];

export default menu;
