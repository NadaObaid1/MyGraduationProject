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
  import { Box, useToast } from "native-base";
  import RNPickerSelect from "react-native-picker-select";
  import axios from "axios";
  
  const EditSalon = ({ route }) => {
    const { item } = route.params;
  
   const initialValues = item
      ? {...item}
      : {
          name: "",
          branches: "",
        };
    const [FData, setFData] = useState({
      ...initialValues,
    });
    const toast = useToast();
   
   
    const baseUrl = "https://ayabeautyn.onrender.com";
      const handleEditSalon = (itemId) => {
        const configurationObject = {
          url:  `${baseUrl}/salons/salon/${itemId}`,
          method: "PUT",
          data: FData,
        };
        axios(configurationObject)
          .then((response) => {
            if (response.status === 200) {
                toast.show({
                    render: () => (
                      <Box bg="emerald.500" px="5" py="5" rounded="sm" mb={5}>
                        Salon updated successfully
                      </Box>
                    ),
                  });
                setFData({
                  name: "",
                  branches: "",
                });
              }
               else {
              throw new Error("An error has occurred");
            }
          })
          .catch((error) => {
            toast.show({
                render: () => (
                  <Box bg="red.500" px="5" py="5" rounded="sm" mb={5}>
                    Error updating salon
                  </Box>
                ),
              });
          });
      };

    const navigation = useNavigation();
    return (
      <ScrollView>
        <View style={styles.contanier}>
          <Text style={styles.TextStyleHeader}>Update Salon</Text>
  
          <View style={styles.formgroup}>
            <TextInput
              value={FData.name}
              onChangeText={(text) => setFData({ ...FData, name: text })}
              style={styles.input}
              placeholder="Salon Name "
            />
            <FontAwesomeIcon icon={faFileSignature} style={styles.icon} />
          </View>
  
          <View style={styles.formgroup}>
            <TextInput
              value={FData.branches}
              onChangeText={(text) => setFData({ ...FData, branches: text })}
              style={[styles.input]}
              placeholder="Branches"
            />
            <FontAwesomeIcon
              icon={faBook}
              style={[styles.icon, styles.iconDis]}
            />
          </View>
  
          <TouchableOpacity onPress={() => handleEditSalon(item._id)}>
            <Text style={styles.buttonStyle}>Edit Salon</Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => navigation.navigate("SalonScreen")}>
            <Text style={[styles.buttonStyle, styles.buttonStyle1]}>cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  
  export default EditSalon;
  
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
      marginTop: 40,
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
  });
  