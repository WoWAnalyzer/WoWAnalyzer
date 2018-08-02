import Raven from 'raven';

export default function configureRaven(app) {
  if (process.env.RAVEN_DSN) {
    Raven.config(process.env.RAVEN_DSN, {
      captureUnhandledRejections: true,
    }).install();
    // The Raven request handler must be the first middleware on the app
    app.use(Raven.requestHandler());
    // The error handler must be before any other error middleware
    app.use(Raven.errorHandler());
  }
}
