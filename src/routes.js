import { Router } from 'express';
// import multer from 'multer';

const routes = new Router();

routes.get('/', async (req, res) => {
  return res.status(200).json();
});

export default routes;
