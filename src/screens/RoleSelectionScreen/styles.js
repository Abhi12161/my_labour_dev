import { StyleSheet } from 'react-native';

import { colors } from '../../theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  logo: {
    fontSize: 42,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  heroSection: {
    marginBottom: 24,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subheadline: {
    textAlign: 'center',
    color: '#777',
  },
  rolesGrid: {
    gap: 16,
  },
  roleCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconContainer: {
    width: 55,
    height: 55,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  roleTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  roleDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 4,
  },
  ctaButton: {
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  ctaText: {
    fontWeight: '800',
    color: '#111',
  },
  footer: {
    backgroundColor: colors.panelMuted,
    padding: 16,
    gap: 8,
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
