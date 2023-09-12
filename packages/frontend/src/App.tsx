import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import React, { useEffect, useState } from 'react';

import FrontPageContainerComponent from './pages/frontPage/frontPage.container';
import RegistrationPageContainer from './pages/registrationPage/registrationPage.container';
import { menuPresenter, registrationPageController, router } from './shared/composition';

const browserRoutes = [
  {
    id: 'home',
    component: <FrontPageContainerComponent menuPresenter={menuPresenter} />,
  },
  {
    id: 'register',
    component: <RegistrationPageContainer controller={registrationPageController} />,
  },
];

function App() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(undefined);

  useEffect(() => {
    router.onRouteChange('app', (routeId) => {
      setCurrentRoute(routeId);
    });
    router.loadApplicationRoutes();
  }, []);

  return (
    <>
      {browserRoutes.map(({ id, component }) => {
        return currentRoute === id ? (
          <div key={id} className="container">
            {component}
          </div>
        ) : null;
      })}
    </>
  );
}

export default App;
