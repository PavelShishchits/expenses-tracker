import fastify, { type FastifyInstance, type FastifyError } from "fastify";
import { cookiesPlugin } from "./plugins/cookies.js";
import { corsPlugin } from "./plugins/cors.js";
import { helmetPlugin } from "./plugins/helmet.js";
import { setupAuth } from "./plugins/auth.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: process.env.NODE_ENV !== "test",
  });

  // External plugins register themselves on root via fastify-plugin internally
  await app.register(helmetPlugin);
  await app.register(corsPlugin);
  await app.register(cookiesPlugin);

  // Auth decorators added directly to root so all route scopes inherit them
  setupAuth(app);

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const message =
      statusCode < 500 || process.env.NODE_ENV !== "production"
        ? error.message
        : "Internal Server Error";
    reply.status(statusCode).send({ error: message });
  });

  app.get("/health", async () => ({ status: "ok" }));

  // Route groups registered here in Phase 3+

  return app;
}
