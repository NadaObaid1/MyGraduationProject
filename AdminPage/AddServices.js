import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Button } from "react-native-elements";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBook,
  faFileSignature,
  faDollarSign,
  faCloudUploadAlt,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import Color from "../src/Common/Color.js";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { serialize } from "object-to-formdata";
import { Box, useToast } from "native-base";
import { Select } from "native-base";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const AddServices = () => {
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [selectedSubServices, setSelectedSubServices] = useState("Body");
  const [t] = useTranslation();

  const { _id: salonId, name: salonName } = useSelector(
    (state) => state.user.usedSalonData
  );

  const [FData, setFData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    time: "",
    subServices: [],
    status: [],
    image: "",
    SalonId: salonId,
  });
  const toast = useToast();
  const [buttonText, setButtonText] = useState(t("Upload Image"));
  const [image, setImage] = useState(image);

  const handleSubServicesChange = (selectedsubServices) => {
    setFData((prevData) => ({
      ...prevData,
      subServices: selectedsubServices,
    }));
    setSelectedSubServices(selectedsubServices); // هنا تم تحديث selectedStatus
  };

  const handleStautsChange = (selectedStauts) => {
    setFData((prevData) => ({
      ...prevData,
      status: selectedStauts,
    }));
    setSelectedStatus(selectedStauts); // هنا تم تحديث selectedSubServices
  };

  useEffect(() => {
    console.log("FData updated:", FData);
  }, [FData]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
      setButtonText(t("Image is uploaded successfully"));
    }
  };

  const handleAddServices = async () => {
    try {
      const options = {
        indices: false,
        nullsAsUndefineds: false,
        booleansAsIntegers: false,
        allowEmptyArrays: false,
        noFilesWithArrayNotation: false,
        dotsForObjectNotation: true,
      };

      const formData = serialize(FData, options);

      formData.append("image", {
        uri: image.uri,
        name: FData.name + ".jpg",
        type: "image/jpeg",
        size: image.fileSize,
      });
      const baseUrl = "https://ayabeautyn.onrender.com";

      const response = await fetch(`${baseUrl}/services/CreateServices`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error("Error during fetch:", response.status, responseData);
        toast.show({
          render: () => (
            <Box bg="#c81912" px="5" py="5" rounded="sm" mb={5}>
              {t("Error adding services")} {responseData.message}
            </Box>
          ),
        });
        return;
      }
      console.log("Request successful:", responseData);
      toast.show({
        render: () => {
          return (
            <Box bg="#55a44e" px="5" py="5" rounded="sm" mb={5}>
              {t("Services added successfully")}
            </Box>
          );
        },
      });
      setFData({
        name: "",
        description: "",
        price: "",
        discount: "",
        time: "",
        subServices: "",
        status: "",
        image: "",
      });
      setImage(null);
      setButtonText("Upload Image");
    } catch (error) {
      console.error("Error during fetch:", error);
      toast.show({
        render: () => (
          <Box bg="red.500" px="5" py="5" rounded="sm" mb={5}>
            {t("Error adding service")}
          </Box>
        ),
      });
    }
  };

  const navigation = useNavigation();
  return (
    <ScrollView>
      <View style={styles.contanier}>
        <Text style={styles.TextStyleHeader}>{t("Add Service")}</Text>

        <View style={styles.formgroup}>
          <TextInput
            value={FData.name}
            onChangeText={(text) => setFData({ ...FData, name: text })}
            style={styles.input}
            placeholder={t("Service name")}
          />
          <FontAwesomeIcon icon={faFileSignature} style={styles.icon} />
        </View>

        <View style={styles.formgroup}>
          <TextInput
            value={FData.description}
            onChangeText={(text) => setFData({ ...FData, description: text })}
            style={[styles.input, styles.inputDis]}
            placeholder={t("Service description")}
            multiline={true}
          />
          <FontAwesomeIcon
            icon={faBook}
            style={[styles.icon, styles.iconDis]}
          />
        </View>

        <View style={styles.formgroup}>
          <TextInput
            value={FData.price}
            onChangeText={(text) => setFData({ ...FData, price: text })}
            style={styles.input}
            placeholder={t("Service price")}
          />
          <FontAwesomeIcon icon={faDollarSign} style={styles.icon} />
        </View>

        <View style={styles.formgroup}>
          <TextInput
            value={FData.discount}
            onChangeText={(text) => setFData({ ...FData, discount: text })}
            style={styles.input}
            placeholder={t("Dis")}
          />
          <FontAwesomeIcon icon={faDollarSign} style={styles.icon} />
        </View>

        <View style={styles.formgroup}>
          <TextInput
            value={FData.time}
            onChangeText={(text) => setFData({ ...FData, time: text })}
            style={styles.input}
            placeholder={t("Service time")}
          />
          <FontAwesomeIcon icon={faClock} style={styles.icon} />
        </View>

        <SafeAreaView
          style={{
            marginTop: 20,
          }}
        >
          <View style={styles.serviceListContainer}>
            <Select
              placeholder={t("Body")}
              color={Color.primary}
              style={{ width: 180, fontSize: 14 }}
              selectedValue={selectedSubServices}
              onValueChange={(value) => handleSubServicesChange(value)}
            >
              {[
                { id: 1, name: t("Body") },
                { id: 2, name: t("Face") },
              ].map((item) => (
                <Select.Item
                  key={item.id}
                  label={item?.name}
                  value={item.name}
                />
              ))}
            </Select>
          </View>

          <View style={styles.serviceListContainer}>
            <Select
              placeholder={t("ac")}
              color={Color.primary}
              style={{ width: 150, fontSize: 14 }}
              selectedValue={selectedStatus}
              onValueChange={(valueitem) => {
                handleStautsChange(valueitem);
              }}
            >
              {[
                { id: 1, name: t("ac") },
                { id: 2, name: t("Ina") },
              ].map((item) => (
                <Select.Item
                  key={item.id}
                  label={item?.name}
                  value={item.name}
                />
              ))}
            </Select>
          </View>
        </SafeAreaView>

        <View style={{ marginHorizontal: 10, marginTop: 20 }}>
          <Button
            title={buttonText}
            onPress={pickImage}
            buttonStyle={{
              backgroundColor: "transparent",
              width: "100%",
              height: 60,
              borderWidth: 2,
              borderColor: "#c3b4d2",
            }}
            titleStyle={{ color: "#757a79", fontSize: 15, marginLeft: 0 }}
          />
          <FontAwesomeIcon
            icon={faCloudUploadAlt}
            style={[styles.icon, styles.iconDis]}
          />
          {image && (
            <Image
              source={{ uri: image.uri }}
              style={{
                width: 335,
                height: 180,
                margin: 20,
                borderRadius: 10,
                marginLeft: 15,
              }}
            />
          )}
        </View>

        <TouchableOpacity onPress={() => handleAddServices()}>
          <Text style={styles.buttonStyle}>{t("Add")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("ServicesScreen")}>
          <Text style={[styles.buttonStyle, styles.buttonStyle1]}>
            {t("Cancel")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AddServices;

const styles = StyleSheet.create({
  contanier: {
    width: "100%",
    height: "100%",
  },
  TextStyleHeader: {
    fontWeight: "500",
    color: Color.primary,
    fontSize: 24,
    marginTop: 70,
    marginBottom: 5,
    textAlign: "center",
    textTransform: "uppercase",
  },
  formgroup: {
    display: "flex",
    position: "relative",
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    position: "absolute",
    color: Color.primary,
    marginHorizontal: 20,
    padding: 11,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 15,
    padding: 50,
    marginHorizontal: 10,
    borderColor: "#c3b4d2",
    borderWidth: 2,
  },
  inputDis: {
    paddingBottom: 100,
  },
  iconDis: {
    marginHorizontal: 20,
    top: 20,
  },

  buttonStyle: {
    padding: 20,
    marginTop: 80,
    marginHorizontal: 10,
    backgroundColor: Color.primary,
    fontWeight: "400",
    fontSize: 19,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    color: "#fff",
  },
  buttonStyle1: {
    backgroundColor: "transparent",
    color: Color.primary,
    marginTop: 10,
  },
  serviceListContainer: {
    width: "95%",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#c3b4d2",
    marginHorizontal: 10,
  },
});
