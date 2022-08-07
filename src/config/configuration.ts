import ConfigurationInterface from './configuration.interface';

export default () =>
  ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
      host: process.env.DB_HOST || 'http://localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      name: process.env.DB_DATABASE || 'postgres',
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      entities: process.env.DB_ENTITIES || '',
      type: process.env.DB_TYPE || 'postgres',
    },
    jwtSecret: process.env.JWT_SECRET || 'test',
    images: {
      folder: process.env.IMG_FOLDER || './images/',
      maxSize: 2048,
    },
  } as ConfigurationInterface);
