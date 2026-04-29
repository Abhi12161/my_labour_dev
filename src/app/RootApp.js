import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { AuthScreen } from '../screens/AuthScreen/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen/DashboardScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen/RoleSelectionScreen';
import {
  addPostedJob as addPostedJobAction,
  clearSelectedRole,
  resetAppFlow,
  selectRole,
  setLanguage,
} from '../store/appSlice';
import { logout } from '../store/authSlice';
import { colors } from '../theme/tokens';

export default function RootApp() {
  const dispatch = useDispatch();
  const { language, selectedRole, postedJobs } = useSelector((state) => state.app);
  const session = useSelector((state) => state.auth.session);

  const handlePostJob = (job) => {
    dispatch(addPostedJobAction(job));
  };

  const handleRoleSelect = (role) => {
    dispatch(selectRole(role));
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetAppFlow());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {session ? (
        <DashboardScreen
          postedJobs={postedJobs}
          language={language}
          session={session}
          onChangeLanguage={(nextLanguage) => dispatch(setLanguage(nextLanguage))}
          onPostJob={handlePostJob}
          onLogout={handleLogout}
        />
      ) : selectedRole ? (
        <AuthScreen
          language={language}
          onChangeLanguage={(nextLanguage) => dispatch(setLanguage(nextLanguage))}
          preSelectedRole={selectedRole}
          onBack={() => dispatch(clearSelectedRole())}
        />
      ) : (
        <RoleSelectionScreen
          language={language}
          onChangeLanguage={(nextLanguage) => dispatch(setLanguage(nextLanguage))}
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
