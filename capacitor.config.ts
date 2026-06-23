import type { CapacitorConfig } from '@capacitor/cli'

const devServerUrl = process.env.CAP_SERVER_URL

const config: CapacitorConfig = {
  appId: 'app.tereo.app',
  appName: 'Te Reo',
  webDir: 'dist',
  server: devServerUrl
    ? {
        url: devServerUrl,
        cleartext: devServerUrl.startsWith('http://'),
      }
    : undefined,
  ios: {
    contentInset: 'automatic',
    scheme: 'Te Reo',
  },
  android: {
    allowMixedContent: true,
  },
}

export default config
