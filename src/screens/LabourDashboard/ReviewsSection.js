// sections/ReviewsSection.js
// Section 6: Reviews list + Work history + Info panel + Messages panel
// Data: labourReviews, labourWorkHistory, labourMessages (all static from dashboardData)
// Actions: none (read-only display)

import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InfoPanel } from '../../components/InfoPanel';
import {
  labourMessages,
  labourReviews,
  labourWorkHistory,
} from '../../data/dashboardData';
import { styles } from './styles';

// ─── Data helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the initial letter of a reviewer's name for the avatar,
 * defaulting to 'U'.
 *
 * @param {string} author
 * @returns {string}
 */
export function getReviewAvatarLetter(author) {
  return author?.charAt(0)?.toUpperCase() || 'U';
}

// ─── Sub-component: reviews list ──────────────────────────────────────────────

function ReviewsList({ text }) {
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailCardHeader}>
        <View style={styles.detailCardTitleWrap}>
          <Ionicons name="star-outline" size={13} color="#0c5a49" />
          <Text style={styles.detailCardTitle}>{text.reviewsTitle}</Text>
        </View>
      </View>

      <View style={styles.reviewList}>
        {labourReviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAuthorWrap}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {getReviewAvatarLetter(review.author)}
                  </Text>
                </View>
                <Text style={styles.reviewAuthor}>{review.author}</Text>
              </View>

              <View style={styles.reviewRatingChip}>
                <Ionicons name="star" size={11} color="#f4b740" />
                <Text style={styles.reviewRatingText}>5.0</Text>
              </View>
            </View>

            <Text style={styles.reviewText}>{review.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Sub-component: work history list ─────────────────────────────────────────

function WorkHistoryList({ text }) {
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailCardHeader}>
        <View style={styles.detailCardTitleWrap}>
          <Ionicons name="time-outline" size={13} color="#0c5a49" />
          <Text style={styles.detailCardTitle}>{text.workHistoryTitle}</Text>
        </View>
      </View>

      <View style={styles.historyList}>
        {labourWorkHistory.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyTopRow}>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <View style={styles.historyRatingChip}>
                <Ionicons name="star" size={11} color="#f4b740" />
                <Text style={styles.historyRatingText}>{item.rating}</Text>
              </View>
            </View>

            <View style={styles.historyMetaRow}>
              <Ionicons name="business-outline" size={12} color="#0c5a49" />
              <Text style={styles.historyMetaText}>{item.customer}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Sub-component: messages panel ────────────────────────────────────────────

function MessagesPanel({ text }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{text.messengerTitle}</Text>
      <View style={styles.messageList}>
        {labourMessages.map((item) => (
          <View key={item.id} style={styles.messageItem}>
            <Text style={styles.messageName}>{item.name}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageStatus}>{item.status}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * ReviewsSection
 * Renders reviews, work history, the info notification panel, and messages.
 * All data is static (sourced from dashboardData).
 *
 * Props:
 *   text {object} - i18n copy object
 */
export function ReviewsSection({ text }) {
  return (
    <>
      <ReviewsList text={text} />
      <WorkHistoryList text={text} />
      <InfoPanel title={text.notifyTitle} body={text.notifyLabour} />
      <MessagesPanel text={text} />
    </>
  );
}

