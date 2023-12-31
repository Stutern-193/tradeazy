import * as dotenv from 'dotenv';
import pino from 'pino';
import { environment } from './utils/config/environment';
import { fastifyFormbody } from '@fastify/formbody';
import './utils/prisma';
import fastify, { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { startServer } from './utils/config/server';
import { initRoute } from './routes/index.routes';
// import multipart from '@fastify/multipart';
// import { FileSizeLimit } from './utils/constants';

export const server = fastify({
  maxParamLength: 1000,
  logger: pino({ level: 'info' }),
}) as unknown as FastifyInstance;

server.register(fastifyFormbody);
server.register(cors);
server.register(helmet, {
  global: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'", 'https://checkout-v3-ui-prod.f4b-flutterwave.com'],
      connectSrc: ["'self'", 'https://api.ravepay.co'],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://checkout.flutterwave.com',
        'https://api.ravepay.co/v2/checkout/upgrade',
        '*',
      ],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      // Add other directives as needed
    },
  },
});
server.register(fastifyJwt, { secret: environment.appJwtSecret });
// server.register(multipart, {
//   limits: {
//     fileSize: FileSizeLimit,
//   },
// });
server.setErrorHandler((error, request, reply) => {
  //TODO: Check if error is of type ZodError and handle accordingly
  //   log error
  reply.code(error.statusCode || 400).send({
    success: false,
    message: error.message,
  });
});

initRoute(server);
startServer(server);
