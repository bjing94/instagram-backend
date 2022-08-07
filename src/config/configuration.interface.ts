export interface ImagePropertiesInterface {
  folder: string;
  maxSize: number;
}
export interface DatabasePropertiesInterface {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  entities: string;
  type: string;
}
export default interface ConfigurationInterface {
  port: number;
  database: DatabasePropertiesInterface;
  jwtSecret: string;
  images: ImagePropertiesInterface;
}
