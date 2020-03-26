import { Router } from 'express';

import ProccessUrl from './app/controllers/ProccessUrl';

const routes = new Router();

routes.post('/download', ProccessUrl.requestNewDownload);
routes.post('/downloadMany', ProccessUrl.requestNewManyDownload);
routes.post('/getInfo', ProccessUrl.getVideoInfo);

routes.post('/checkStatus', ProccessUrl.getFileStatus);

routes.post('/getFile', ProccessUrl.getFile);

export default routes;
