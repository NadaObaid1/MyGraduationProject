import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import Header from "../screens/Header.js";
import NavbarButtom from "../Common/NavbarButtom.js";
import Color from "../Common/Color.js";
import Spacing from "../Common/Spacing.js";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const UserHistory = () => {
  const navigation = useNavigation();
  const [t] = useTranslation();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { id: userId, name: userName } = useSelector(
    (state) => state.user.userData
  );
  const { _id: salonId, name: salonName } = useSelector(
    (state) => state.user.usedSalonData
  );

  const currentDate = new Date();

  const getStatus = (appointmentDate) => {
    const appointmentDateTime = new Date(appointmentDate);

    if (appointmentDateTime < currentDate) {
      return "Done";
    } else {
      return "Coming";
    }
  };

  const handleHomePress = (item) => {
    navigation.navigate("MainScreen2", { item });
  };

  const handleDetailsPress = (item) => {
    navigation.navigate("UserDetails", { item });
  };

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });
    } else {
      alert("Must use a physical device for Push Notifications");
    }

    setExpoPushToken(token.data);
    return token.data;
  };

  const sendPushNotification = async (
    expoPushToken,
    appointmentDate,
    appointmentTime
  ) => {
    const notificationData1 = {
      expoPushToken,
      title: `${salonName}: Appointment Canceled ❌`,
      body: `Hello, ${userName}! Your appointment on ${appointmentDate} at ${appointmentTime} has been canceled.`,
      data: { someData: "goes here" },
      salonId: salonId,
      userId: userId,
      toUser: false,
    };

    const notificationData2 = {
      expoPushToken,
      title: `Appointment Canceled ❌`,
      body: `${userName} has canceled an appointment on ${appointmentDate} at ${appointmentTime} at your salon!`,
      data: { someData: "goes here" },
      salonId: salonId,
      userId: userId,
    };

    try {
      const backendResponse1 = await fetch(
        `${baseUrl}/notifications/notification`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData1),
        }
      );

      if (!backendResponse1.ok) {
        throw new Error(`Backend Error: ${backendResponse1.statusText}`);
      }

      const backendResponse2 = await fetch(
        `${baseUrl}/notifications/notification`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData2),
        }
      );

      if (!backendResponse2.ok) {
        throw new Error(`Backend Error: ${backendResponse2.statusText}`);
      }
    } catch (backendError) {
      console.error(
        "Error sending notification to the backend:",
        backendError.message
      );
    }

    const expoMessage = {
      to: expoPushToken,
      sound: "default",
      title: `${salonName}: Appointment Canceled ❌`,
      body: `Hello, ${userName}! Your appointment on ${appointmentDate} at ${appointmentTime} has been canceled.`,
      data: { someData: "goes here" },
    };

    try {
      const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expoMessage),
      });

      if (!expoResponse.ok) {
        throw new Error(`Expo Error: ${expoResponse.statusText}`);
      }
    } catch (expoError) {
      console.error("Error sending notification to Expo:", expoError.message);
    }
  };
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {});

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const confirmDelete = (itemId, appointmentDate, appointmentTime) => {
    Alert.alert(
      t("Confirm cancellation"),
      t("Are you sure you want to cancel this appointment?"),
      [
        {
          text: t("No"),
          style: "cancel",
        },
        {
          text: t("Yes, Cancel"),
          onPress: () => handleCancleAppointment(itemId, appointmentDate, appointmentTime),
        },
      ],
      { cancelable: false }
    );
  };
  const baseUrl = "https://ayabeautyn.onrender.com";

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/auth/${userId}/Appointment/userAppointment`
      );
      const data = await response.json();
      setItems(data); // Set the fetched data to items state
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const handleCancleAppointment = async (
    itemId,
    appointmentDate,
    appointmentTime
  ) => {
    try {
      const response = await fetch(
        `${baseUrl}/appointments/appointment/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        sendPushNotification(expoPushToken, appointmentDate, appointmentTime);
        fetchData();
      } else {
        const responseData = await response.json();
        console.error("Failed to delete item. Server response:", responseData);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Header />

      <View
        style={{
          width: "30%",
          marginLeft: 15,
        }}
      ></View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.appointmentContainer}>
            <View style={styles.userContainer}>
              <Text style={styles.userName}>{item.user_name}</Text>
              <Text style={styles.appointmentContent}>
                Branch: {item.branch}
              </Text>
              <Text style={styles.appointmentContent}>
                Date: {item.appointment_date}
              </Text>
              <Text style={styles.appointmentContent}>
                Time: {item.appointment_time}
              </Text>
              <Text style={styles.appointmentContent}>
                Service: {item.serviceType}
              </Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.appointmentContent}>
                  Status: {getStatus(item.appointment_date)}
                </Text>

                <TouchableOpacity
                  style={styles.styleIcons}
                  onPress={() => handleDetailsPress(item)}
                >
                  <Text style={styles.details}>{t("User Details")}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() =>
                confirmDelete(
                  item._id,
                  item.appointment_date,
                  item.appointment_time
                )
              }
            >
              <Ionicons name="close" color="red" size={Spacing * 1.5} />
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity onPress={handleHomePress}>
        <Text style={styles.buttonStyle}>{t("Home")}</Text>
      </TouchableOpacity>

      <NavbarButtom onChange={(selectedIcon) => console.log(selectedIcon)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.secondary,
  },
  appointmentContainer: {
    backgroundColor: "#ffffff",
    margin: 15,
    marginBottom: 2,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Color.primary,
    position: "relative",
  },
  userContainer: {
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    padding: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555555",
  },
  appointmentContent: {
    fontSize: 17,
    color: "#848482",
    fontWeight: "bold",
  },
  styleText: {
    color: Color.primary,
    fontSize: Spacing * 2,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 10,
    marginBottom: -15,
  },
  buttonStyle: {
    width: "35%",
    padding: 10,
    marginHorizontal: 250,
    fontWeight: "400",
    fontSize: 18,
    letterSpacing: 2,
    textAlign: "center",
    color: Color.secondary,
    backgroundColor: Color.primary,
    alignSelf: "center",
    marginTop: 15,
  },
  deleteIcon: {
    marginTop: -80,
  },
  removeButton: {
    position: "absolute",
    top: Spacing / 2,
    left: Spacing * 22,
    padding: Spacing / 2,
    zIndex: 1,
  },
  styleIcons: {
    backgroundColor: Color.primary,
    padding: Spacing / 2,
    borderRadius: Spacing,
    marginTop: -8,
  },
  details: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "400",
    padding: 4,
  },
  select: {
    flex: 1,
    fontSize: 18,
  },
});

export default UserHistory;
