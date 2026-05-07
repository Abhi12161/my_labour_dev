// sections/NotificationsSection.js
// Section 5: Notification feed (polling every 8s)
// Data: notifications, notificationsLoading
// Actions: none (read-only display)

import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { localStyles } from './sharedStyles';

// ─── Data helpers ─────────────────────────────────────────────────────────────

/** Max notifications shown at once (matches original slice(0, 6)). */
export const NOTIFICATIONS_DISPLAY_LIMIT = 6;

/**
 * Formats a notification timestamp into a locale string.
 * @param {string} timestamp - ISO date string
 * @returns {string}
 */
export function formatNotificationTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return '';
  }
}

// ─── Sub-component: single notification card ──────────────────────────────────

function NotificationCard({ notification }) {
  return (
    <View style={localStyles.notificationCard}>
      <View style={localStyles.notificationTopRow}>
        <Text style={localStyles.notificationStatus}>
          {notification.statusLabel || notification.status}
        </Text>
        <Text style={localStyles.notificationTime}>
          {formatNotificationTime(notification.timestamp)}
        </Text>
      </View>

      <Text style={localStyles.notificationMessage}>{notification.message}</Text>

      {notification.jobTitle ? (
        <Text style={localStyles.notificationMeta}>Job: {notification.jobTitle}</Text>
      ) : null}
      {notification.actorName ? (
        <Text style={localStyles.notificationMeta}>Labour: {notification.actorName}</Text>
      ) : null}
      {notification.actorMobile ? (
        <Text style={localStyles.notificationMeta}>Phone: {notification.actorMobile}</Text>
      ) : null}
      {notification.actorAddress ? (
        <Text style={localStyles.notificationMeta}>Address: {notification.actorAddress}</Text>
      ) : null}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * NotificationsSection
 * Renders a list of recent notifications. Hidden entirely when there are
 * no notifications and nothing is loading.
 *
 * Props:
 *   text                {object}   - i18n copy object
 *   notifications       {Array}    - notification objects
 *   notificationsLoading{boolean}
 */
export function NotificationsSection({ text, notifications, notificationsLoading }) {
  const hasContent = notificationsLoading || notifications.length > 0;

  if (!hasContent) return null;

  return (
    <View style={styles.sectionCard}>
      {/* ── Header ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Ionicons name="notifications-outline" size={13} color="#0c5a49" />
          <Text style={styles.sectionTitle}>{text.notificationsTitle}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{notifications.length}</Text>
        </View>
      </View>

      {/* ── List ── */}
      <View style={styles.jobsList}>
        {notificationsLoading ? (
          <Text style={{ color: '#6b7c74' }}>Loading notifications...</Text>
        ) : null}

        {notifications
          .slice(0, NOTIFICATIONS_DISPLAY_LIMIT)
          .map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
      </View>
    </View>
  );
}

