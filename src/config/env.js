import { Platform } from 'react-native';

const fallbackUrl = Platform.select({
  android: 'http://10.244.206.55:5000/api',
  ios: 'http://10.244.206.55:5000/api', 
  default: 'http://10.244.206.55:5000/api',
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || fallbackUrl;