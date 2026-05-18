import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  artworkFrame: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#ffffff',
  },
  artwork: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  hitArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  hindiHitArea: {
    left: '27%',
    top: '22.1%',
    width: '11%',
    height: '3.8%',
  },
  englishHitArea: {
    left: '39.2%',
    top: '22.1%',
    width: '12.4%',
    height: '3.8%',
  },
  bhojpuriHitArea: {
    left: '53.4%',
    top: '22.1%',
    width: '12.6%',
    height: '3.8%',
  },
  customerHitArea: {
    left: '4.6%',
    top: '51.1%',
    width: '90.8%',
    height: '18.9%',
  },
  labourHitArea: {
    left: '4.6%',
    top: '71.3%',
    width: '90.8%',
    height: '19.4%',
  },
});
