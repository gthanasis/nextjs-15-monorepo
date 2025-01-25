import { ControlMsc } from "../../service";
import { AuthController } from "./controller";
import { AsyncErrorHandler, Router } from "microservice";
import { generateAuthService } from "./index";
import { auth } from "middlewares";
const router = Router();

export default (msc: ControlMsc): Router => {
  const { logger, jtwLib } = msc;
  const service = generateAuthService(msc);
  const controller = new AuthController({ service, logger });

  router.get(
    "/auth/login/google",
    AsyncErrorHandler(controller.loginGoogle.bind(controller)),
  );

  router.get(
    "/auth/login/google/callback",
    AsyncErrorHandler(controller.loginGoogleCallback.bind(controller)),
  );

  router.get(
    "/auth/login/google/onetouch",
    AsyncErrorHandler(controller.loginGoogleOneTouch.bind(controller)),
  );

  if (process.env.ALLOW_DEMO_LOGIN) {
    router.get(
      "/auth/login/demo",
      AsyncErrorHandler(controller.loginDemo.bind(controller)),
    );
  }

  router.get(
    "/auth/impersonate",
    auth({ jtwLib, roles: ["admin"], logger }),
    AsyncErrorHandler(controller.impersonate.bind(controller)),
  );

  router.get(
    "/auth/logout",
    AsyncErrorHandler(controller.logout.bind(controller)),
  );

  return router;
};
