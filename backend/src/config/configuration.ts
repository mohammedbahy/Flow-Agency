export default () => ({
  port: parseInt(process.env.PORT ?? process.env.BACKEND_PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    // Sprint 1 will wire these into a real auth implementation.
    secret: process.env.JWT_SECRET ?? 'change_me_dev_only_not_a_real_secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '3600s',
  },
});
