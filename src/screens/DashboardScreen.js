import { StyleSheet, View } from 'react-native';
import { CustomerDashboard } from './CustomerDashboard';
import { LabourDashboard } from './LabourDashboard';

/**
 * DashboardScreen Component
 *
 * This component acts as the main dashboard router.
 * It decides which dashboard to render based on the user's role.
 *
 * Props:
 * - session: Object containing user session info (role, name, etc.)
 * - postedJobs: Array of jobs posted by the customer
 * - language: Current language setting
 * - onPostJob: Function to add a new posted job
 * - onChangeLanguage: Function to change language
 * - onLogout: Function to log out the current user
 */
const DashboardScreen = ({
  session,
  postedJobs,
  language,
  onPostJob,
  onChangeLanguage,
  onLogout,
  navigation,
}) => {
  // Check if the user is a customer
  const isCustomer = session?.role === 'customer';

  return (
    <View style={styles.container}>
      {isCustomer ? (
        // Render CustomerDashboard for customers
        <CustomerDashboard
          session={session}
          postedJobs={postedJobs}
          language={language}
          onPostJob={onPostJob}
          onChangeLanguage={onChangeLanguage}
          onLogout={onLogout}
          navigation={navigation}
        />
      ) : (
        // Render LabourDashboard for labour workers
        <LabourDashboard
          session={session}
          postedJobs={postedJobs}
          language={language}
          onChangeLanguage={onChangeLanguage}
          onLogout={onLogout}
          navigation={navigation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Optional: default background
  },
});

export default DashboardScreen;