declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    API: string;
    X_API_KEY: string;
  }
}
