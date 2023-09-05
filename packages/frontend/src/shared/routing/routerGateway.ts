export type BrowserRouteConfig = {
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
  private routePaths: string[] = [];
  private routeEventsCleanup: (() => void)[] = [];

  constructor() {
    this.history = window.history;
    this.turnBrowserHistoryChangeReactive();
    this.setNavigatorBackButtonListener();
  }

  private turnBrowserHistoryChangeReactive() {
    this.history.pushState = new Proxy(this.history.pushState, {
      apply: (target, thisArg, argArray: [History, string, string?]) => {
        target.apply(thisArg, argArray);
        this.dispathRouteChanged();
        return;
      },
    });
  }

  private setNavigatorBackButtonListener() {
    window.addEventListener('popstate', (e: PopStateEvent) => {
      e.preventDefault();
      this.dispathRouteChanged();
    });
  }

  private dispathRouteChanged() {
    window.dispatchEvent(new CustomEvent('routechanged'));
  }

  private cleanupRouteEvents() {
    this.routeEventsCleanup.forEach((cleanup) => cleanup());
    this.routeEventsCleanup = [];
  }

  navigateTo(route: string) {
    this.history.pushState({}, '', route);
  }

  loadApplicationRoutes(routes: BrowserRouteConfig[]): void {
    this.cleanupRouteEvents();
    this.routePaths = [];

    routes.forEach((route) => {
      this.routePaths.push(route.path);
      const listener = () => {
        if (this.currentBrowserRoute === route.path) {
          route.onEnter();
        }
      };
      this.routeEventsCleanup.push(() => {
        window.removeEventListener('routechanged', listener);
      });
      window.addEventListener('routechanged', listener);
    });

    if (!this.initialBrowserRouteExists()) {
      this.goToHome();
      return;
    }
    this.goToCurrentBrowserRoute();
  }

  private initialBrowserRouteExists() {
    return this.routePaths.includes(this.currentBrowserRoute);
  }

  private get currentBrowserRoute() {
    return window.location.pathname;
  }

  private goToHome() {
    this.navigateTo('/');
  }

  private goToCurrentBrowserRoute() {
    this.navigateTo(this.currentBrowserRoute);
  }
}
