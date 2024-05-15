import { RouteObject } from 'react-router-dom';
import Home from '../pages/Home';
import MainLayout from '../layouts/MainLayout';
import {
  Ability,
  Frame,
  Rarity,
  Role,
  Trait,
  Type,
  CardPack,
} from '../pages/attributes/index';
import {
  CardCreate,
  CardEdit,
  CardPreview,
  CardsManagement,
} from '../pages/cards/index';
import CardLayout from '../layouts/CardLayout';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/attributes',
        children: [
          {
            index: true,
            path: 'role',
            element: <Role />,
          },
          {
            path: 'type',
            element: <Type />,
          },
          {
            path: 'rarity',
            element: <Rarity />,
          },
          {
            path: 'trait',
            element: <Trait />,
          },
          {
            path: 'ability',
            element: <Ability />,
          },
          {
            path: 'frame',
            element: <Frame />,
          },
          {
            path: 'cardPack',
            element: <CardPack />,
          },
        ],
      },
      {
        path: '/cards',
        children: [
          {
            index: true,
            element: <CardsManagement />,
          },
        ],
      },
    ],
  },
  {
    path: '/card',
    element: <CardLayout />,
    children: [
      {
        path: 'edit/:id?',
        element: <CardEdit />,
      },
      {
        path: 'preview/:id',
        element: <CardPreview />,
      },
    ],
  },
];

export default routes;
