import { Provider } from 'react-redux';
import RootApp from '../src/app/RootApp';
import { store } from '../src/store';

export default function AppEntry() {
  return (
    <Provider store={store}>
      <RootApp />
    </Provider>
  );
}
