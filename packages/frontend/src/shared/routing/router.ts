import { GlobalCache } from '../persistence/globalState';

type ApplicationRouteConfig = {
  id: string;
  path: string;
};

type BrowserRouteConfig = {
  id: string;
  path: string;
  onEnter: () => void;
};

interface RouterGateway {
  navigateTo(route: string): void;
  loadApplicationRoutes(routes: BrowserRouteConfig[]): void;
}

export class BrowserRouterGateway implements RouterGateway {
  private history: History;

  constructor() {
    this.history = window.history;
    this.history.pushState = new Proxy(this.history.pushState, {
      apply: (target, thisArg, argArray: [History, string, string?]) => {
        target.apply(thisArg, argArray);
        window.dispatchEvent(new CustomEvent('routechanged'));
        return;
      },
    });
  }

  private routeEventsCleanup: (() => void)[] = [];

  loadApplicationRoutes(routes: BrowserRouteConfig[]): void {
    this.cleanupRouteEvents();
    routes.forEach((route) => {
      const listener = () => {
        if (window.location.pathname === route.path) {
          console.log(window.location.pathname, route.path);
          route.onEnter();
        }
      };
      this.routeEventsCleanup.push(() => {
        window.removeEventListener('routechanged', listener);
      });
      window.addEventListener('routechanged', listener);
    });
  }

  private cleanupRouteEvents() {
    this.routeEventsCleanup.forEach((cleanup) => cleanup());
    this.routeEventsCleanup = [];
  }

  navigateTo(route: string) {
    this.history.pushState({}, '', route);
  }
}

export class Router {
  private currentRoute: { id: string };
  private listeners: { [key: string]: (routeId: string) => void } = {};

  constructor(private cache: GlobalCache, private routerGateway: RouterGateway) {
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
    // console.log(`Route changed to ${this.currentRoute.id}`);
    this.notifyRouteChange();
  }

  onRouteChange(listener: string, callback: (routeId: string) => void) {
    if (this.listeners[listener]) {
      return;
    }

    this.listeners[listener] = callback;
  }

  private notifyRouteChange() {
    Object.keys(this.listeners).forEach((listener) => {
      this.listeners[listener](this.currentRoute.id);
    });
  }

  navigateTo(routeId: string) {
    const route = this.routes.find((route) => route.id === routeId);

    if (!route) {
      return;
    }

    this.routerGateway.navigateTo(route.path);
    this.notifyRouteChange();
  }
}
