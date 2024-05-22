import { INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { TestingModule } from '@nestjs/testing';
import express from 'express';
export const getTestingApp = async (
  moduleRef: TestingModule,
): Promise<INestApplication<ExpressAdapter>> => {
  try {
    const app = moduleRef.createNestApplication(new ExpressAdapter(express()));
    await app.listen(0);
    await app.init();
    return app;
  } catch (error) {
    throw Error(error.message);
  }
};

export const delay = async (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 500));
};
