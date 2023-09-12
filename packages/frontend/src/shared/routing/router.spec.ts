import { Router } from './router';
import { BrowserRouterGateway } from './routerGateway';

describe('Router behaviour', () => {
  test('it pass', () => {
    expect(true).toBe(true);
  });

  let routerGateway: BrowserRouterGateway;
  let router: Router;
  let currentRoute: string;

  beforeEach(() => {
    routerGateway = new BrowserRouterGateway();
    router = new Router(routerGateway);

    router.onRouteChange('app', (routeId) => {
      currentRoute = routeId;
    });
  });

  test('The current route is undefined before registering routes', () => {
    expect(currentRoute).toBeUndefined();
  });

  test('The current route is home after registering routes', () => {
    router.loadApplicationRoutes();
    expect(currentRoute).toBe('home');
  });

  test('The current route is register after navigating to register page', () => {
    router.navigateTo('register');
    expect(currentRoute).toBe('register');
  });

  test('The current route is home after navigating to home page', () => {
    router.navigateTo('home');
    expect(currentRoute).toBe('home');
  });

  test('The current route is home after navigating to a page that does not exist', () => {
    router.navigateTo('not-found');
    expect(currentRoute).toBe('home');
  });
});
