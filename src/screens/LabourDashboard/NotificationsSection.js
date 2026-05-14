// sections/NotificationsSection.js
// Section 3: Labour notification feed (polling every 8s in parent)
// Data: notifications[], notificationsLoading
// Actions: none (read-only)

import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

// ─── Data helpers ─────────────────────────────────────────────────────────────

/** Max notifications to display at once. */
export const NOTIFICATIONS_DISPLAY_LIMIT = 3;

/**
 * Returns the Ionicons icon name for a given notification.
 * @param {object} notification
 * @returns {string} icon name
 */
export function getNotificationIcon(notification) {
  if (notification.type === 'today_work') return 'flash-outline';
  if (notification.status === 'hired') return 'checkmark-done-outline';
  return 'document-text-outline';
}

/**
 * Formats a notification timestamp to a locale time string.
 * @param {string} timestamp - ISO date string
 * @returns {string}
 */
export function formatNotificationTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString();
  } catch {
    return '';
  }
}

// ─── Sub-component: single notification card ──────────────────────────────────

function NotificationCard({ notification }) {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.notificationTopRow}>
        <View style={styles.notificationIconWrap}>
          <Ionicons
            name={getNotificationIcon(notification)}
            size={12}
            color="#0c5a49"
          />
        </View>
        <Text style={styles.detailCardHint}>
          {notification.statusLabel || notification.status}
        </Text>
        <Text style={styles.notificationTime}>
          {formatNotificationTime(notification.timestamp)}
        </Text>
      </View>

      <Text style={styles.notificationText}>{notification.message}</Text>

      {notification.jobTitle ? (
        <Text style={styles.detailCardHint}>Job: {notification.jobTitle}</Text>
      ) : null}
      {notification.jobLocation ? (
        <Text style={styles.detailCardHint}>
          Location: {notification.jobLocation}
        </Text>
      ) : null}
      {notification.actorName ? (
        <Text style={styles.detailCardHint}>Name: {notification.actorName}</Text>
      ) : null}
      {notification.actorAddress ? (
        <Text style={styles.detailCardHint}>
          Address: {notification.actorAddress}
        </Text>
      ) : null}
      {notification.actorMobile ? (
        <Text style={styles.detailCardHint}>
          Phone: {notification.actorMobile}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * NotificationsSection
 * Renders a capped list of recent labour notifications.
 * Hidden entirely when there is nothing to show.
 *
 * Props:
 *   text                 {object}  - i18n copy object
 *   notifications        {Array}   - notification objects
 *   notificationsLoading {boolean}
 */
export function NotificationsSection({ text, notifications, notificationsLoading }) {
  const hasContent = notificationsLoading || notifications.length > 0;

  if (!hasContent) return null;

  return (
    <View style={styles.detailCard}>
      {/* ── Header ── */}
      <View style={styles.detailCardHeader}>
        <View style={styles.detailCardTitleWrap}>
          <Ionicons name="notifications-outline" size={13} color="#0c5a49" />
          <Text style={styles.detailCardTitle}>{text.notificationsTitle}</Text>
        </View>
      </View>

      {/* ── List ── */}
      <View style={styles.notificationList}>
        {notificationsLoading ? (
          <Text style={styles.detailCardHint}>Loading notifications...</Text>
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
