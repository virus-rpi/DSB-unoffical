import { StatusBar } from 'expo-status-bar';
import {RefreshControl, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import Carousel from "./components/carousel";
import React from "react";
import {useApi} from "./API";

function App(): React.JSX.Element {
  const API = useApi();
  const {data, school_name, possible_classes} = API.getData();
  const [class_, setClass] = React.useState(possible_classes[0]);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar backgroundColor="#ff3c3c" />
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      <View style={styles.header} >
        <Text style={styles.headerText}>{school_name}</Text>
      </View>
      <Carousel
        data_raw={data}
        class_={class_}
        setClass={setClass}
        class_list={possible_classes}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272727',
  },
  header: {
    backgroundColor: '#ff3c3c',
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    fontWeight: 'semibold',
  },
  headerText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default App;
