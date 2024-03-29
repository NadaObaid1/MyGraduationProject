import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "react-native-elements";
import { FontAwesome as Icon } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import Color from "../Common/Color.js";
import Spacing from "../Common/Spacing.js";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const Jobs = () => {
  const navigation = useNavigation();
  const [t] = useTranslation();

  const { role, token } = useSelector((state) => state.user.userData);

  const { _id: salonId, name: salonName } = useSelector(
    (state) => state.user.usedSalonData
  );

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = "https://ayabeautyn.onrender.com";
  const fetchData = async () => {
    try {
      const response = await fetch(`${baseUrl}/salons/${salonId}/Job/job`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Nada__${token}`,
        },
      });
      const data = await response.json();
      setItems(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error); 
    }
  };

  const handleDeletePress = async (itemId) => {
    try {
      const response = await fetch(`${baseUrl}/jobs/job/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Nada__${token}`,
        },
      });

      if (response.ok) {
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
      <TouchableOpacity
        style={{ marginLeft: Spacing * 2, marginTop: Spacing * 3 }}
        onPress={() => {
          navigation.navigate("MainJob");
        }}
      >
        <Ionicons name="arrow-back" color={Color.primary} size={Spacing * 2} />
      </TouchableOpacity>

      <View style={styles.container1}></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.textHeader}>
          {t("Here are the jobs")}{" "}
          <Image
            style={{ width: 50, height: 50 }}
            source={require("../../assets/pic2.jpg")}
          />
        </Text>
        <Text style={styles.textHeader1}>
          {t("we currently have available")}
        </Text>

        {(role === "Admin" || role === "Manager") && (
          <TouchableOpacity
            onPress={() => navigation.navigate("AddJob")}
            style={{
              marginTop: 30,
              backgroundColor: Color.primary,
              borderWidth: 1,
              borderColor: "#fff",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: "#fff",
                fontSize: 16,
              }}
            >
              {t("Add Job")}
            </Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={items.slice().reverse()}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <>
              <Card containerStyle={styles.card}>
                {(role === "Admin" || role === "Manager") && (
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => handleDeletePress(item._id)}
                  >
                    <Icon name="close" color="#5e366a" size={20} />
                  </TouchableOpacity>
                )}
                <Card.Title style={styles.cardTitle}>{item.jobName}</Card.Title>
                <Card.Title style={styles.cardTitlee}>
                  {item.jobDescription}
                </Card.Title>
                <Image
                  source={{ uri: item?.image?.secure_url }}
                  style={styles.cardImage}
                />
              </Card>
            </>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  container1: {
    flexDirection: "row",
    paddingTop: 1,
    paddingLeft: 15,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
  },
  textHeader: {
    fontSize: 25,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginLeft: 15,
  },
  textHeader1: {
    fontSize: 18,
    fontWeight: "500",
    textTransform: "uppercase",
    marginLeft: 15,
    color: Color.primary,
  },

  card: {
    borderRadius: 5,
    backgroundColor: "#f6f6f6",
    marginBottom: 10,
    position: "relative",
  },
  cardTitle: {
    color: Color.primary,
    fontSize: 19,
    letterSpacing: 2,
    marginBottom: 10,
  },
  cardTitlee: {
    color: "#4c4c4c",
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 10,
    fontWeight: "800",
    textAlign: "left",
  },
  cardImage: {
    width: "100%",
    height: 300, // ارتفاع الصورة الثابت داخل الكارت
    resizeMode: "cover",
  },

  deleteIcon: {
    left: 300,
  },
});

export default Jobs;
