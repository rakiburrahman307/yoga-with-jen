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
const app: Application = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(
     cors({
          origin: '*',
          credentials: true,
     }),
);
app.post('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));

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
// setupTrialManagement();
export default app;
