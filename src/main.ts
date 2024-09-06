import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './settings/apply-app-setting';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './settings/configuration';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyAppSettings(app)
  app.use(cookieParser())
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiSettings = configService.get('apiSettings', { infer: true });
  await app.listen(apiSettings.PORT);
}
bootstrap();
