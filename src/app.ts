import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import router from './routes';
import { Morgan } from './shared/morgen';
import globalErrorHandler from './globalErrorHandler/globalErrorHandler';
import { notFound } from './app/middleware/notFound';
import { welcome } from './utils/welcome';
import handleStripeWebhook from './helpers/stripe/handleStripeWebhook';
import path from 'path';
import setupTrialManagement from './utils/cornJobs';
import config from './config';
const app: Application = express();
app.post('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));
//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(
     cors({
          origin: config.node_env === "production" ? [
               "https://web.yogawithjen.life",
               "https://api.yogawithjen.life",
               "https://dashboard.yogawithjen.life",
               "https://wwww.dashboard.yogawithjen.life",
               "https://www.web.yogawithjen.life",

          ] : ["http://10.10.7.48:3007",
               "http://10.10.7.48:3001",
               "http://10.10.7.48:3002",
               "http://10.10.7.48:3003",
               "http://10.10.7.48:3004",
               "http://10.10.7.48:3005",
               "http://10.10.7.48:3010",
               "http://10.10.7.48:3006"],
          credentials: true,  // Allow credentials like cookies
     })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
const baseUploadDir = getUploadDirectory();
app.use(express.static(baseUploadDir));

//router
app.use('/api/v1', router);
//live response
app.get('/', (req: Request, res: Response) => {
     res.send(welcome());
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use(notFound);
setupTrialManagement();
export default app;
