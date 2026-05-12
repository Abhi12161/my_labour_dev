function getNotificationKey(notification) {
  return [
    notification.status || '',
    notification.statusLabel || '',
    notification.message || '',
    notification.timestamp || '',
    notification.jobTitle || '',
    notification.jobLocation || '',
    notification.actorName || '',
    notification.actorMobile || '',
  ].join('|');
}

export function mergeUniqueNotifications(...notificationGroups) {
  const allNotifications = notificationGroups.flat().filter(Boolean);
  const seen = new Map();

  allNotifications.forEach((notification) => {
    const key = getNotificationKey(notification);

    if (!seen.has(key)) {
      seen.set(key, notification);
    }
  });

  return Array.from(seen.values()).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
}
