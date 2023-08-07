import { StatusBar } from 'expo-status-bar';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import Carousel from "./components/carousel";
import React from "react";
import {getData} from "./API";

function App(): JSX.Element {
  const {data, school_name, possible_classes} = getData();
  const [class_, setClass] = React.useState(possible_classes[0]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ff3c3c" />
      <View style={styles.header}>
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
