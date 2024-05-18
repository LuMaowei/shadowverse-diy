import { RouteObject } from 'react-router-dom';
import Home from '../pages/Home';
import MainLayout from '../layouts/MainLayout';
import { Ability, CardPack, Trait } from '../pages/attributes/index';
import { CardEdit, CardsManagement } from '../pages/cards/index';

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
            path: 'trait',
            element: <Trait />,
          },
          {
            path: 'ability',
            element: <Ability />,
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
          {
            path: '/cards/edit/:id?',
            element: <CardEdit />,
          },
        ],
      },
    ],
  },
];

export default routes;
