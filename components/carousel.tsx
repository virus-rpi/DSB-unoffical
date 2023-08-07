import React, {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import ListViewSelect from './list-view-select';
import {SettingsComponent} from "./settings";

export enum ItemType {
  omitted = 'omitted',
  stand_in = 'stand-in',
  room_change = 'room-change',
}
export interface Item {
  subject: string;
  type: ItemType;
  room: string;
  teacher: string;
  time: [number, number];
  araf: string;
}
export interface Card {
  id: string;
  date: Date;
  items: Item[];
  missing_teachers: string[];
  class: string;
}

interface CarouselProps {
  class_: string;
  setClass: Dispatch<SetStateAction<string>>;
  class_list: string[];
  data_raw: Card[];
}

function getTodayOrTomorrow(date: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return 'Heute: ';
  } else if (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  ) {
    return 'Morgen: ';
  } else {
    return '';
  }
}

const Carousel = ({class_, setClass, class_list, data_raw}: CarouselProps) => {
  const flatListRef = useRef<FlatList<Card>>(null);

  const data = useMemo<Card[]>(() => {
    const filteredData = data_raw.filter(card => card.class === class_);

    if (filteredData.length === 0) {
      return [
        {
          id: 'settings',
          date: new Date(),
          items: [],
          class: class_,
          missing_teachers: [],
        },
        {
          id: '0',
          date: new Date(),
          items: [],
          missing_teachers: [],
          class: class_,
        },
      ];
    }

    const settingCard = filteredData.find(card => card.id === 'settings');

    if (!settingCard) {
       return [{
        id: 'settings',
        date: new Date(),
        items: [],
        class: class_,
        missing_teachers: [],
      }, ...filteredData];

    }

    return filteredData;
  }, [class_, data_raw]);

  useEffect(() => {
    flatListRef.current?.scrollToIndex({animated: false, index: 1});
  }, [class_]);

  const animatedButtonY = useState(new Animated.Value(0))[0];

  const [classSelectionVisible, setClassSelectionVisible] = useState(false);
  const classSelectionOpacity = animatedButtonY.interpolate({
    inputRange: [
      -(Dimensions.get('window').height - Dimensions.get('window').height / 4),
      0,
    ],
    outputRange: [1, 0],
  });
  const cardOpacity = classSelectionOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.5],
  });
  const classSelectionScaleX = animatedButtonY.interpolate({
    inputRange: [
      -(Dimensions.get('window').height - Dimensions.get('window').height / 4),
      0,
    ],
    outputRange: [1, 0.95],
  });

  const onClassSelectionPress = (option: string) => {
    setClass(option);
    Animated.timing(animatedButtonY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setClassSelectionVisible(false);
    });
  };

  const renderCard = ({item}: {item: Card}) => {
    if (item.id === 'settings') {
      return (
        <View style={styles.card_wrapper}>
          <View style={styles.card}>
            <SettingsComponent />
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.card_wrapper}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOpacity,
              },
            ]}>
            <Text style={styles.cardDate}>
              {getTodayOrTomorrow(item.date)}
              {item.date.getDate()}.{item.date.getMonth()}.
              {item.date.getFullYear()}
            </Text>
            {item.items.length > 0 && (
              <FlatList
                style={styles.item}
                data={item.items}
                renderItem={renderItem}
                keyExtractor={item => item.subject}
                ItemSeparatorComponent={() => (
                  <View style={styles.itemSeparator}>
                    <View style={styles.itemSeparatorLine} />
                  </View>
                )}
              />
            )}
            {item.items.length === 0 && (
              <View>
                <Text style={styles.itemNoInfo}>Leider nichts :(</Text>
              </View>
            )}
            {item.missing_teachers.length > 0 && (
              <View>
                <Text style={styles.itemMissingTeacher}>
                  Fehlende Lehrer: {'\n'}
                  {item.missing_teachers.slice(0, -1).join(', ')}
                  {item.missing_teachers.length > 1 && ', '}
                  {item.missing_teachers.slice(-1)}
                </Text>
              </View>
            )}
          </Animated.View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                if (classSelectionVisible) {
                  Animated.timing(animatedButtonY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start(() => {
                    setClassSelectionVisible(false);
                  });
                } else {
                  setClassSelectionVisible(true);
                  Animated.timing(animatedButtonY, {
                    toValue: -(
                      Dimensions.get('window').height -
                      Dimensions.get('window').height / 4
                    ),
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                }
              }}
              style={[
                styles.button,
                {
                  transform: [{translateY: animatedButtonY}],
                },
              ]}>
              <Text style={styles.buttonText}>{class_}</Text>
            </TouchableOpacity>
          </View>
          <Animated.View
            style={[
              styles.classSelectionContainer,
              {
                display: classSelectionVisible ? 'flex' : 'none',
                transform: [{scaleX: classSelectionScaleX}],
                height: classSelectionVisible
                  ? Dimensions.get('window').height
                  : Dimensions.get('window').height * 0.84,
              },
            ]}>
            <Animated.View
              style={[styles.classSelection, {opacity: classSelectionOpacity}]}>
              <ListViewSelect
                options={class_list}
                selected={class_}
                onItemSelect={onClassSelectionPress}
              />
            </Animated.View>
          </Animated.View>
        </View>
      );
    }
  };

  const renderItem = ({item}: {item: Item}) => (
    <View>
      <Text style={styles.itemTitle}>
        {item.subject} {item.type === ItemType.omitted && 'Entfall'}
        {item.type === ItemType.stand_in && 'Vertretung'}
        {item.type === ItemType.room_change && 'Raumänderung'}
      </Text>
      <Text style={styles.itemInfo}>
        Wann: {item.time[0]}{' '}
        {item.time[1] !== item.time[0] && '- ' + item.time[1]} Stunde
      </Text>
      {item.teacher !== '' && (
        <Text style={styles.itemInfo}>Wer: {item.teacher}</Text>
      )}
      {item.room !== '' && <Text style={styles.itemInfo}>Wo: {item.room}</Text>}
      {item.araf !== '' && (
        <Text style={styles.itemInfo}>ARAF: {item.araf}</Text>
      )}
    </View>
  );

  const keyExtractor = (item: Card) => item.id;

  return (
    <View style={styles.container}>
        <FlatList
        horizontal
        data={data}
        renderItem={renderCard}
        keyExtractor={keyExtractor}
        pagingEnabled
        snapToInterval={Dimensions.get('window').width}
        ref={flatListRef}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
          flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: Dimensions.get('window').height * 0.02,
  },
  card: {
    backgroundColor: '#dedede',
    borderRadius: 20,
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').height * 0.84,
  },
  card_wrapper: {
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').height * 0.84,
    marginHorizontal: 10,
    overflow: 'visible',
  },
  cardDate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#434343',
    padding: '5%',
  },
  item: {
    left: '5%',
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  itemInfo: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
  },
  itemSeparator: {
    height: 15,
    width: '90%',
    justifyContent: 'center',
  },
  itemSeparatorLine: {
    backgroundColor: 'grey',
    height: 2,
  },
  itemNoInfo: {
    fontSize: 20,
    fontWeight: '500',
    color: '#757575',
    left: 20,
  },
  itemMissingTeacher: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#434343',
    padding: 20,
    bottom: 60,
  },
  button: {
    width: 100,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    left: Dimensions.get('window').width / 2 - 65,
  },
  buttonText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000000',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: Dimensions.get('window').height * 0.02,
    zIndex: 100,
    position: 'absolute',
  },
  classSelectionContainer: {
    top: 0,
    left: '-5%',
    position: 'absolute',
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
  },
  classSelection: {
    width: Dimensions.get('window').width * 0.95,
    top: -Dimensions.get('window').height * 0.04,
    maxHeight: Dimensions.get('window').height * 0.85 - 100,
  },
});

export default Carousel;
