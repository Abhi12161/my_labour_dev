import { StyleSheet } from 'react-native';

import { colors, radius } from '../../theme/tokens';

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  heroCard: {
    backgroundColor: colors.hero,
    borderRadius: radius.xl,
    padding: 24,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#dfe6e3',
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  switchText: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '700',
    marginTop: 6,
  },
  envBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.panelMuted,
    gap: 6,
  },
  envTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  envBody: {
    color: colors.textMuted,
    fontSize: 13,
  },
  envCode: {
    color: colors.primary,
    fontWeight: '700',
  },
});
