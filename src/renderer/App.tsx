import { useRoutes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Boot } from '@wangeditor/editor';

import './App.css';
import 'tailwindcss/tailwind.css';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import routes from './config/routes';
import '@wangeditor/editor/dist/css/style.css';
import abilityModule from './components/richTextModules/ability';

dayjs.locale('zh-cn');
Boot.registerModule(abilityModule);

export default function App() {
  const element = useRoutes(routes);
  return <ConfigProvider locale={zhCN}>{element}</ConfigProvider>;
}
