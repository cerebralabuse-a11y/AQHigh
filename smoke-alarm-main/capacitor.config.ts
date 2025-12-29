import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aqi2cigs.app',
  appName: 'AQI2CIGS',
  webDir: 'dist',
  // For localhost development, uncomment the server config below:
  // server: {
  //   url: 'http://localhost:5173',
  //   cleartext: true
  // }
  // For production, remove the server config entirely (app will use local files)
};

export default config;
