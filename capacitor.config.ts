import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexus.app', // Substitua pelo ID real do seu app, se diferente
  appName: 'Nexus',
  webDir: 'out', // Como estamos usando Next.js, a pasta de exportação estática geralmente é 'out'
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '178354696383-2mddvngvaopvlf9o9l0nbvibjkuss4aq.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
  },
};

export default config;
