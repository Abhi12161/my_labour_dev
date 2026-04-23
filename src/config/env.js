import { Platform } from 'react-native';

const fallbackUrl = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || fallbackUrl;
