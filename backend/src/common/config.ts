export const config = {
  port: Number(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN,
  jwtSecret: process.env.JWT_SECRET,
};
