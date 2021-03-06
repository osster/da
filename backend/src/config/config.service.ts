import { TypeOrmModuleOptions } from '@nestjs/typeorm';
const path = require('path');

require('dotenv').config();

class ConfigService {

  constructor(private env: { [k: string]: string | undefined }) { }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach(k => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      entities: ['**/*.entity{.ts,.js}'],
      migrationsTableName: 'migration',
      migrations: ['src/database/migration/*.ts'],
      cli: {
        migrationsDir: 'src/database/migration',
      },
      ssl: this.isProduction(),
    };
  }

  public getRedisConfig() {
    return {
      host: this.getValue('REDIS_HOST'),
      port: parseInt(this.getValue('REDIS_PORT')),
      password: this.getValue('REDIS_PASS'),
    };
  }

  public getTmpDir() {
    return path.resolve(__dirname , '..', '..', `${this.getValue('TMP_DIR')}`);
  }

}

const configService = new ConfigService(process.env)
  .ensureValues([
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_PASS',
    'TMP_DIR',
  ]);

export { configService };