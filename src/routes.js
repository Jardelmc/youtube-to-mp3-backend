import { Router } from 'express';

import ProccessUrl from './app/controllers/ProccessUrl';

const routes = new Router();

routes.post('/download', ProccessUrl.requestNewDownload);
routes.post('/downloadMany', ProccessUrl.requestNewManyDownload);
routes.post('/getInfo', ProccessUrl.getVideoInfo);

// routes.post('/setHash', ProccessUrl.setProccessHash);
// routes.post('/getHash', ProccessUrl.getProccessHash);

export default routes;
