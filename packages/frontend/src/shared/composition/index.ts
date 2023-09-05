import { UserRepository } from '../../modules/users/repos/userRepo';
import { RegistrationPageController } from '../../pages/registrationPage/registrationPage.controller';
import { MenuPresenter } from '../components/menu/menuPresenter';
import { NotificationService } from '../notifications/notificationService';
import { GlobalCache } from '../persistence/globalState';
import { Router } from '../routing/router';
import { BrowserRouterGateway } from '../routing/routerGateway';

const cache = new GlobalCache();
const userRepo = new UserRepository(cache);
const menuPresenter = new MenuPresenter(cache);
const notificationsService = new NotificationService();
const registrationPageController = new RegistrationPageController(notificationsService, userRepo);
const routerGateway = new BrowserRouterGateway();
const router = new Router(routerGateway);

export { cache, menuPresenter, notificationsService, registrationPageController, router, userRepo };
