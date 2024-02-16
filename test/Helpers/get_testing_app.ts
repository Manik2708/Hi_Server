import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

export const getTestingApp = async (moduleRef: TestingModule):Promise<INestApplication>=>{
    const app = moduleRef.createNestApplication();
    app.listen(3001);
    await app.init();
    return app;
}