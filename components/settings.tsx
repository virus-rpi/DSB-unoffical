import {View, Text, Switch, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from "react";

export function SettingsComponent() {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [showSchoolPicker, setShowSchoolPicker] = useState(false);
    const [schoolName, setSchoolName] = useState("");
    const [schoolUsername, setSchoolUsername] = useState("");
    const [schoolPassword, setSchoolPassword] = useState("");
    const [showClassPicker, setShowClassPicker] = useState(false);
    const [classes, setClasses] = useState([""]);
    const [newClass, setNewClass] = useState("");
    const newClassInput = React.createRef<TextInput>();

    useEffect(() => {
        if (settings().loadData("darkMode") === null) {
            settings().saveData("darkMode", "false").catch((e) => console.error(e));
        }
        settings().loadData("darkMode").then((value) => {
            if (value === "true") {
                setDarkMode(true);
            }
        }).catch((e) => console.error(e));

        if (settings().loadData("notifications") === null) {
            settings().saveData("notifications", "false").catch((e) => console.error(e));
        }
        settings().loadData("notifications").then((value) => {
            if (value === "true") {
                setNotifications(true);
            }
        }).catch((e) => console.error(e));

        if (settings().loadData("classes") === null) {
            settings().saveData("classes", "[]").catch((e) => console.error(e));
        }
        settings().loadData("classes").then((value) => {
          if (typeof value === "string") {
            setClasses(JSON.parse(value));
          }
        }).catch((e) => console.error(e));
    }, []);

    const toggleDarkMode = async () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        settings().saveData("darkMode", newValue.toString()).catch((e) => console.error(e));
    };

    const toggleNotifications = async () => {
        const newValue = !notifications;
        setNotifications(newValue);
        settings().saveData("notifications", newValue.toString()).catch((e) => console.error(e));
    }

    const saveSchool = async () => {
        const school = {
            name: schoolName,
            username: schoolUsername,
            password: schoolPassword
        };
        settings().saveData("school", JSON.stringify(school)).catch((e) => console.error(e));
    }

    const saveClasses = async () => {
        settings().saveData("classes", JSON.stringify(classes)).catch((e) => console.error(e));
    }

    const darkModeComponent = () => (
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
              trackColor={{ false: "#d0d0d0", true: "#1c1c1c" }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleDarkMode}
              value={darkMode}
          />
        </View>
    );

    const classComponent = ({item}: {item: string}) => (
         <View style={styles.settingRow}>
              <Text  style={styles.settingText}>{item}</Text>
              <View style={{width: 10}} />
              <TouchableOpacity
                  onPress={() => {
                      const newClasses = classes.filter((value) => value !== item);
                      setClasses(newClasses);
                  }}
                  style={styles.deleteButton}
              >
                  <Text style={styles.buttonText}>x</Text>
              </TouchableOpacity>
          </View>
    );

    return (
    <View>
      <Text style={styles.heading}>Settings</Text>
      <View style={styles.settingView}>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch
            trackColor={{ false: '#d0d0d0', true: '#1c1c1c' }}
            thumbColor={'#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleNotifications}
            value={notifications}
          />
        </View>
        <TouchableOpacity
            onPress={() => {setShowSchoolPicker(true)}}
            style={styles.settingRow}
        >
            <Text style={styles.settingText}>Change School</Text>
        </TouchableOpacity>
        <View style={{height: 10}} />
        <TouchableOpacity
            onPress={() => {setShowClassPicker(true)}}
            style={styles.settingRow}
        >
          <Text style={styles.settingText}>Your Classes</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSchoolPicker}
        onRequestClose={() => {
          setShowSchoolPicker(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modal}>
            <View>
              <TextInput
                style={styles.input}
                placeholder="Name"
                onChangeText={(text) => {setSchoolName(text)}}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                onChangeText={(text) => {setSchoolUsername(text)}}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={(text) => {setSchoolPassword(text)}}
              />
            </View>
            <View style={{height: 10}} />
            <View style={styles.settingRow}>
              <TouchableOpacity
                onPress={() => {setShowSchoolPicker(false)}}
                style={[
                  styles.button,
                  {backgroundColor: "#ff9c9c"}
                ]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{width: 10}}></View>
              <TouchableOpacity
                onPress={() => {
                  setShowSchoolPicker(false);
                  saveSchool()
                }}
                style={[
                  styles.button,
                  {backgroundColor: "#6ad1ff"}
                ]}
              >
                <Text style={styles.buttonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showClassPicker}
        onRequestClose={() => {
          setShowClassPicker(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modal}>
            <View style={styles.settingRow}>
              <TextInput
                ref={newClassInput}
                style={styles.inputInlined}
                placeholder="Class Name"
                onChangeText={(text) => {setNewClass(text)}}
              />
              <TouchableOpacity
                onPress={() => {if (newClass !== "" && !(newClass in classes)) setClasses([...classes, newClass]); newClassInput.current?.clear(); setNewClass("")}}
              >
                <Text style={{fontSize: 30}}>+</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={classes}
              renderItem={classComponent}
              keyExtractor={(item, index) => index.toString()}
            />
            <View style={styles.settingRow}>
              <TouchableOpacity
                onPress={() => {
                  setShowClassPicker(false);
                  settings().loadData("classes").then((value) => {
                    if (typeof value === "string") {
                      setClasses(JSON.parse(value));
                    }
                    }).catch((e) => console.error(e));
                }}
                style={[
                  styles.button,
                  {backgroundColor: "#ff9c9c"}
                ]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{width: 10}}></View>
              <TouchableOpacity
                onPress={() => {
                  setShowClassPicker(false);
                  saveClasses();
                }}
                style={[
                  styles.button,
                  {backgroundColor: "#6ad1ff"}
                ]}
              >
                <Text style={styles.buttonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function settings() {

    const saveData = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };
    const loadData = async (key: string) => {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) {
                return value;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    };

    return { saveData, loadData }
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
  },
  settingView: {
    marginTop: 5,
    padding: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingText: {
    fontSize: 20,
  },
  modal: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  button: {
    width: 100,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000000',
  },
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    backgroundColor: "#e7e7e7",
    textAlign: 'center',
    borderRadius: 10,
    minWidth: '80%'
  },
  inputInlined: {
    height: 40,
    margin: 12,
    padding: 10,
    backgroundColor: "#e7e7e7",
    textAlign: 'center',
    borderRadius: 10,
    minWidth: '60%'
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    color: "#ff5757"
  }
});
