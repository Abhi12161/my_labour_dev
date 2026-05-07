import { ImageBackground, Pressable, SafeAreaView, ScrollView, View } from 'react-native';

import { styles } from './styles';

const roleSelectionArtwork = require('../../../assets/images/role-selection-reference.jpeg');

export function RoleSelectionScreen({ onChangeLanguage, onSelectRole }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.artworkFrame}>
          <ImageBackground
            source={roleSelectionArtwork}
            resizeMode="contain"
            style={styles.artwork}
            imageStyle={styles.artworkImage}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select Hindi language"
              onPress={() => onChangeLanguage('hi')}
              style={[styles.hitArea, styles.hindiHitArea]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select English language"
              onPress={() => onChangeLanguage('en')}
              style={[styles.hitArea, styles.englishHitArea]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select Bhojpuri language"
              onPress={() => onChangeLanguage('bho')}
              style={[styles.hitArea, styles.bhojpuriHitArea]}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Login as customer"
              onPress={() => onSelectRole('customer')}
              style={[styles.hitArea, styles.customerHitArea]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Login as labour"
              onPress={() => onSelectRole('labour')}
              style={[styles.hitArea, styles.labourHitArea]}
            />
          </ImageBackground>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
