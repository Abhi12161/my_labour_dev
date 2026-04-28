import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import { initialPostedJobs } from '../data/dashboardData';
import { AuthScreen } from '../screens/AuthScreen/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen/DashboardScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen/RoleSelectionScreen';
import { colors } from '../theme/tokens';

export default function RootApp() {
  const [language, setLanguage] = useState('en');
  const [session, setSession] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [postedJobs, setPostedJobs] = useState(initialPostedJobs);

  const addPostedJob = (job) => {
    setPostedJobs((current) => [job, ...current]);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleAuthenticated = (sessionData) => {
    setSession(sessionData);
  };

  const handleLogout = () => {
    setSession(null);
    setSelectedRole(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {session ? (
        <DashboardScreen
          postedJobs={postedJobs}
          language={language}
          session={session}
          onChangeLanguage={setLanguage}
          onPostJob={addPostedJob}
          onLogout={handleLogout}
        />
      ) : selectedRole ? (
        <AuthScreen
          language={language}
          onChangeLanguage={setLanguage}
          onAuthenticated={handleAuthenticated}
          preSelectedRole={selectedRole}
          onBack={() => setSelectedRole(null)}
        />
      ) : (
        <RoleSelectionScreen
          language={language}
          onChangeLanguage={setLanguage}
          onSelectRole={handleRoleSelect}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.page,
  },
});
