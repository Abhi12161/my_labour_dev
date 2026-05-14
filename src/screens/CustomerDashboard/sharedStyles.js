// sharedStyles.js
// Shared CSS/styles used across all CustomerDashboard sections

export const localStyles = {
  // ─── Inputs ───────────────────────────────────────────────────────────────
  input: {
    borderWidth: 1,
    borderColor: '#d6e1dc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f7fbf9',
    color: '#17332e',
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  // ─── Buttons ──────────────────────────────────────────────────────────────
  primaryAction: {
    backgroundColor: '#0c5a49',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // ─── Profile ──────────────────────────────────────────────────────────────
  profileLine: {
    color: '#35554d',
    lineHeight: 20,
  },

  // ─── Application Cards ────────────────────────────────────────────────────
  applicationMetaCard: {
    backgroundColor: '#f6fbf8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2eee8',
  },
  applicationJobTitle: {
    color: '#17332e',
    fontSize: 12,
    fontWeight: '700',
  },
  applicationJobMeta: {
    color: '#5d726a',
    fontSize: 11,
    marginTop: 4,
  },
  applicantProfileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2eee8',
    gap: 5,
  },
  applicantProfileTitle: {
    color: '#17332e',
    fontSize: 13,
    fontWeight: '700',
  },
  applicantProfileMeta: {
    color: '#4f6760',
    fontSize: 11,
    lineHeight: 16,
  },
  applicantProfileBio: {
    color: '#35554d',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },
  applicantSkillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  applicantSkillChip: {
    backgroundColor: '#edf5f1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  applicantSkillText: {
    color: '#325048',
    fontSize: 10,
    fontWeight: '600',
  },
  viewProfileLink: {
    color: '#0c5a49',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },

  // ─── Notifications ────────────────────────────────────────────────────────
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2eee8',
    gap: 6,
  },
  notificationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  notificationStatus: {
    color: '#0c5a49',
    fontSize: 11,
    fontWeight: '700',
  },
  notificationTime: {
    color: '#6b7c74',
    fontSize: 11,
  },
  notificationMessage: {
    color: '#17332e',
    fontSize: 12,
    lineHeight: 18,
  },
  notificationMeta: {
    color: '#4f6760',
    fontSize: 11,
    lineHeight: 16,
  },

  // ─── Bottom Sheet / Modal ─────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 20, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: '#5d726a',
    fontSize: 12,
    marginTop: 4,
  },
  sheetCloseButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sheetCloseText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  sheetContent: {
    gap: 12,
    paddingBottom: 8,
  },
  sheetHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f6fbf8',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2eee8',
  },
  sheetAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0c5a49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAvatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  sheetName: {
    color: '#17332e',
    fontSize: 16,
    fontWeight: '800',
  },
  sheetMeta: {
    color: '#56716a',
    fontSize: 12,
  },
  sheetInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2eee8',
    gap: 6,
  },
  sheetSectionTitle: {
    color: '#17332e',
    fontSize: 13,
    fontWeight: '700',
  },
  sheetInfoText: {
    color: '#4f6760',
    fontSize: 12,
    lineHeight: 18,
  },
  sheetSkillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  sheetSkillChip: {
    backgroundColor: '#edf5f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sheetSkillText: {
    color: '#325048',
    fontSize: 11,
    fontWeight: '600',
  },
  sheetHireButton: {
    backgroundColor: '#0c5a49',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  sheetHireButtonDisabled: {
    backgroundColor: '#7b8f88',
  },
  sheetHireButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
};
