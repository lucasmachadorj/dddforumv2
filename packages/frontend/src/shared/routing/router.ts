import { BrowserRouteConfig, BrowserRouterGateway } from './routerGateway';

type ApplicationRouteConfig = {
  id: string;
  path: string;
};

export class Router {
  private currentRoute: { id: string };
  private listeners: { [key: string]: (routeId: string) => void } = {};

  constructor(private routerGateway: BrowserRouterGateway) {
    this.currentRoute = this.routes[0];
  }

  get routes(): ApplicationRouteConfig[] {
    return [
      {
        id: 'home',
        path: '/',
      },
      {
        id: 'register',
        path: '/register',
      },
    ];
  }

  loadApplicationRoutes() {
    const browserRouteConfigs: BrowserRouteConfig[] = [];

    this.routes.forEach((route) => {
      browserRouteConfigs.push({
        id: route.id,
        path: route.path,
        onEnter: () => {
          this.execRouteHandler(route.id);
        },
      });
    });
    this.routerGateway.loadApplicationRoutes(browserRouteConfigs);
  }

  private execRouteHandler(newRouteId: string) {
    const routeChanged = this.currentRoute.id !== newRouteId;

    if (!routeChanged) {
      return;
    }

    const newRoute = this.routes.find((route) => route.id === newRouteId);

    if (!newRoute) {
      return;
    }

    this.currentRoute = newRoute;
    this.notifyRouteChange();
  }

  onRouteChange(listener: string, callback: (routeId: string) => void) {
    if (this.listeners[listener]) {
      return;
    }

    this.listeners[listener] = callback;
  }

  navigateTo(routeId: string) {
    const route = this.routes.find((route) => route.id === routeId);

    if (!route) {
      this.routerGateway.navigateTo('/');
      return;
    }

    this.routerGateway.navigateTo(route.path);
    this.notifyRouteChange();
  }

  private notifyRouteChange() {
    Object.keys(this.listeners).forEach((listener) => {
      this.listeners[listener](this.currentRoute.id);
    });
  }
}
