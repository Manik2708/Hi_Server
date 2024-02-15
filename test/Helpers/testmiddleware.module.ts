import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthMiddleware } from "../../src/Middlewares/user";

@Module({
})
export class TestMiddlewareModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*')
  }
}