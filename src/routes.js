import { Router } from 'express';

import ProccessUrl from './app/controllers/ProccessUrl';

const routes = new Router();

routes.post('/download', ProccessUrl.requestNewDownload);
routes.post('/downloadMany', ProccessUrl.requestNewManyDownload);
routes.post('/getInfo', ProccessUrl.getVideoInfo);

export default routes;
