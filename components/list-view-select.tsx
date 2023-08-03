import React from 'react';
import {ScrollView, Text, TouchableOpacity} from 'react-native';

interface ListViewSelectProps {
  options: string[];
  selected: string;
  onItemSelect: (option: string) => void;
}

const ListViewSelect = ({
  options,
  selected,
  onItemSelect,
}: ListViewSelectProps) => (
  <ScrollView contentContainerStyle={{borderRadius: 8}}>
    {options.map(option => (
      <TouchableOpacity
        key={option}
        onPress={() => onItemSelect(option)}
        style={{
          backgroundColor: option === selected ? '#bbbbbb' : '#FFFFFF00',
          padding: 8,
          transform: [{translateX: -5}],
        }}>
        <Text
          style={{
            color: '#000',
            fontSize: 20,
            textAlign: 'center',
            opacity: 1,
            fontWeight: 'bold',
          }}>
          {option.replace(/(\d+)([a-zA-Z]+)/g, '$1 $2')}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

export default ListViewSelect;
