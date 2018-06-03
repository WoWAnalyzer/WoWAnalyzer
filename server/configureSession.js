import cookieSession from 'cookie-session';

export default function configureSession(app) {
  if (!process.env.COOKIE_SESSION_SECRET_KEY) {
    throw new Error('The env var "COOKIE_SESSION_SECRET_KEY" was not set. It must be set in non-development environments.');
  }
  app.use(cookieSession({
    name: 'you', // why not give it a silly name if we can change it ¯\_(ツ)_/¯
    keys: [process.env.COOKIE_SESSION_SECRET_KEY],
    maxAge: 3600 * 24 * 365 * 1000, // 1 year
  }));
}
