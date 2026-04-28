import { View } from 'react-native';

import { CustomerDashboard } from '../CustomerDashboard/CustomerDashboard';
import { LabourDashboard } from '../LabourDashboard/LabourDashboard';
import { styles } from './styles';

const DashboardScreen = ({
  session,
  postedJobs,
  language,
  onPostJob,
  onChangeLanguage,
  onLogout,
  navigation,
}) => {
  const isCustomer = session?.role === 'customer';

  return (
    <View style={styles.container}>
      {isCustomer ? (
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

export default DashboardScreen;
