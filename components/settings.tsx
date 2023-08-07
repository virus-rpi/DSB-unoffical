import { View, Text, Switch } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";

export function SettingsComponent() {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(false);

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

    return (
        <View>
            <Text>Settings</Text>
            <View>
                <View>
                    <Text>Dark Mode</Text>
                    <Switch
                        trackColor={{ false: "#d0d0d0", true: "#1c1c1c" }}
                        thumbColor={"#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleDarkMode}
                        value={darkMode}
                    />
                </View>
                <View>
                    <Text>Notifications</Text>
                    <Switch
                        trackColor={{ false: "#d0d0d0", true: "#1c1c1c" }}
                        thumbColor={"#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleNotifications}
                        value={notifications}
                    />
                </View>
                <Text>Change School</Text>
            </View>
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
