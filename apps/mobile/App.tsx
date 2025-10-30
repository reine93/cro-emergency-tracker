import { View, Text } from 'react-native';
import { hello } from '@cro/shared';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Cro Emergency Tracker</Text>
      <Text>{hello}</Text>
    </View>
  );
}