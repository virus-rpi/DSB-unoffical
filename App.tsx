import React from 'react';
import { View, Text, Button } from 'react-native-ui-lib';

export default function App() {
  return (
    <View flex paddingH-25 paddingT-120>
      <Text blue50 text50>React Native UI Lib Example</Text>
      <Button label="Click Me" onPress={() => {}} />
    </View>
  );
}
