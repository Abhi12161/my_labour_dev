import { useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { LinearGradient } from 'expo-linear-gradient';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { LocationCard } from '../../components/LocationCard';
import { copy } from '../../constants/copy';
import { styles } from './styles';

export function RoleSelectionScreen({ language, onChangeLanguage, onSelectRole }) {
  const text = copy[language];
  const location = useSelector((state) => state.location);

  useEffect(() => {
    console.log('FULL LOCATION DATA ðŸ‘‰', location.fullData);
    console.log('CITY ðŸ‘‰', location.fullData?.address?.city);
    console.log('STATE ðŸ‘‰', location.fullData?.address?.state);
    console.log('COUNTRY ðŸ‘‰', location.fullData?.address?.country);
  }, [location]);

  const roles = [
    {
      key: 'customer',
      title: text.needWorkers || 'I need workers',
      description: 'Post your work and connect with nearby workers.',
      cta: 'Start Hiring',
      icon: '👤',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      key: 'labour',
      title: text.offerServices || 'I offer services',
      description: 'Create profile and get work from customers.',
      cta: 'Start Working',
       icon: '🔧',
      gradient: ['#ff7e5f', '#feb47b'],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
           <Text style={styles.logo}>💼</Text>
          <Text style={styles.appName}>{location.fullData?.address?.city}{text.badge}</Text>

          <LanguageSwitcher
            selected={language}
            onChange={onChangeLanguage}
          />
        </View>

        <LocationCard text={text} />

        <View style={styles.heroSection}>
          <Text style={styles.headline}>
            Find trusted workers near you
          </Text>
          <Text style={styles.subheadline}>
            Connect with skilled labour in your city quickly
          </Text>
        </View>

        <View style={styles.rolesGrid}>
          {roles.map((role) => (
            <Pressable
              key={role.key}
              onPress={() => onSelectRole(role.key)}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <LinearGradient
                colors={role.gradient}
                style={styles.roleCard}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{role.icon}</Text>
                </View>

                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>

                <LinearGradient
                  colors={['#ffffff', '#f1f5f9']}
                  style={styles.ctaButton}
                >
                  <Text style={styles.ctaText}>{role.cta}</Text>
                </LinearGradient>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {text.allCitiesAvailable || 'Available in your area'}
            {location.fullData?.address?.city}
          </Text>
          <Text style={styles.footerSubtext}>
            {text.footerBenefits ||
              'Live opportunities nearby â€¢ Better worker-employer matching â€¢ Professional first impression'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
