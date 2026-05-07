// sections/HeroSection.js
// Section 1: Hero banner — greeting, avatar, contact card, logout button
// Data: customerProfile, session
// Actions: onLogout

import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

// ─── Data helper ─────────────────────────────────────────────────────────────

/**
 * Derives display-ready hero data from profile and session.
 * @param {object} customerProfile
 * @param {object} session
 * @returns {{ name: string, phone: string, address: string, avatarLetter: string }}
 */
export function getHeroData(customerProfile, session) {
  const name =
    customerProfile?.name || session?.user?.name || 'User';

  const phone =
    customerProfile?.mobile ||
    customerProfile?.phone ||
    session?.user?.phone ||
    'Not provided';

  const address =
    customerProfile?.address ||
    customerProfile?.location ||
    '';

  const avatarLetter = name.charAt(0).toUpperCase();

  return { name, phone, address, avatarLetter };
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * HeroSection
 * Renders the top hero banner with greeting, avatar initials, contact row,
 * and logout pill.
 *
 * Props:
 *   text            {object}   - i18n copy object
 *   customerProfile {object}   - profile from Redux / API
 *   session         {object}   - auth session
 *   onLogout        {function} - called when user taps Logout
 */
export function HeroSection({ text, customerProfile, session, onLogout }) {
  const { name, phone, address, avatarLetter } = getHeroData(
    customerProfile,
    session
  );

  return (
    <View style={styles.hero}>
      {/* ── Top row: badge + logout ── */}
      <View style={styles.heroTop}>
        <View style={styles.heroTopActions}>
          <View style={styles.badgeWrap}>
            <Ionicons name="home" size={11} color="#ffffff" />
            <Text style={styles.heroBadge}>{text.customerDashboardBadge}</Text>
          </View>

          <Pressable style={styles.logoutPill} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={13} color="#35554d" />
            <Text style={styles.logoutPillText}>{text.logout}</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Body: greeting + avatar ── */}
      <View style={styles.heroBody}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroHello}>{text.hello},</Text>
          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroSubtitle}>{text.customerSubtitle}</Text>
        </View>

        <View style={styles.heroAvatarWrap}>
          <View style={styles.heroAvatarCircle}>
            <Text style={styles.heroAvatarLetter}>{avatarLetter}</Text>
          </View>
          <View style={styles.heroAvatarEdit}>
            <Ionicons name="create-outline" size={11} color="#35554d" />
          </View>
        </View>
      </View>

      {/* ── Contact card ── */}
      <View style={styles.contactCard}>
        <View style={styles.contactRow}>
          <Ionicons name="call-outline" size={12} color="#ffffff" />
          <Text style={styles.contactText}>{phone}</Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="mail-outline" size={12} color="#ffffff" />
          <Text style={styles.contactText}>{address}</Text>
        </View>
      </View>
    </View>
  );
}

