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
        path: 'trait',
        name: '兵种',
        icon: <CrownFilled />,
      },
      {
        path: 'ability',
        name: '能力',
        icon: <CrownFilled />,
      },
      {
        path: 'cardPack',
        name: '卡包',
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
