import {
  Animated,
  Easing,
  Linking,
  ScrollView,
  StyleSheet,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { useUserData } from "@/context/user";
import { SafeAreaView } from "react-native";
import { TouchableOpacity } from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import AddPerson from "@/components/Modals/AddPerson";
import ReadPerson from "@/components/Modals/ReadPerson";
import { useNavigation } from "expo-router";
import { useMessages } from "@/context/messages";
import MessagePopUp from "@/components/MessagePopUp";

interface Person {
  _id: string;
  name: string;
  contact: Number;
  relation: string;
}

const People = () => {
  const navigation = useNavigation();
  const { peopleList } = useUserData();
  const { error, setError, messageText, setMessageText } = useMessages()

  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const slideAddModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen
  const slideEditModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [showEditPersonModal, setShowEditPersonModal] = useState(false);
  const [clickedPersonDetails, setClickedPersonDetails] = useState(
    peopleList[0]
  );

  function handleEditPersonClick(person: Person) {
    setClickedPersonDetails(person);
    openEditModal();
  }

  const openAddModal = () => {
    setShowAddPersonModal(true);

    setTimeout(() => {
      Animated.timing(slideAddModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const closeAddModal = () => {
    Animated.timing(slideAddModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowAddPersonModal(false);
    });
  };

  const openEditModal = () => {
    setShowEditPersonModal(true);

    setTimeout(() => {
      Animated.timing(slideEditModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const closeEditModal = () => {
    Animated.timing(slideEditModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowEditPersonModal(false);
    });
  };

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <TouchableOpacity activeOpacity={0.5} onPress={openAddModal}>
  //         <Ionicons name="add-circle" size={30} color="#4FB92D" />
  //       </TouchableOpacity>
  //     ),
  //   });
  // }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <MessagePopUp
        error={error}
        messageText={messageText}
        setError={setError}
        setMessageText={setMessageText}
      />

      <ScrollView style={styles.peopleContainer}>
        {peopleList.length > 0 ? (
          peopleList.map((person: Person) => (
            <TouchableOpacity
              key={person._id}
              activeOpacity={0.9}
              onPress={() => handleEditPersonClick(person)}
            >
              <PersonCard {...person} />
            </TouchableOpacity>
          ))
        ) : (
          <>
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              <FontAwesome6
                name="circle-exclamation"
                size={40}
                color={textColor}
              />
            </Text>
            <Text style={{ fontSize: 16, textAlign: "center", marginTop: 20 }}>
              You have No One!
            </Text>

            {/* <TouchableOpacity
              activeOpacity={0.8}
              onPress={openAddModal}
              style={[
                styles.smallBox,
                {
                  backgroundColor: "#4FB92D",
                  alignSelf: "center",
                  marginTop: 20,
                },
              ]}
            >
              <Ionicons name="add-circle" size={20} color={textColor} />
              <Text style={styles.addText}>Add Person</Text>
            </TouchableOpacity> */}
          </>
        )}
      </ScrollView>

      <SafeAreaView
        style={{ position: "absolute", bottom: 20, right: 20, zIndex: 10 }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openAddModal}
          style={[styles.smallBox, { backgroundColor: "#4FB92D" }]}
        >
          <Ionicons name="add-circle" size={20} color={"#FFF"} />
          <Text style={[styles.addText, { color: "#FFF" }]}>Add Person</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {showAddPersonModal && (
        <AddPerson
          visible={showAddPersonModal}
          slideModalAnim={slideAddModalAnim}
          handleCloseModal={closeAddModal}
          setPerson={() => { }}
        />
      )}

      {showEditPersonModal && (
        <ReadPerson
          visible={showEditPersonModal}
          slideModalAnim={slideEditModalAnim}
          handleCloseModal={closeEditModal}
          clickedPerson={clickedPersonDetails}
        />
      )}
    </View>
  );
};

const PersonCard = (person: Person) => {
  const { _id, name, contact, relation } = person;

  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  // const oppTextColor = colorScheme === "dark" ? "#000" : "#FFF";

  return (
    <View style={[styles.personCard, { paddingHorizontal: 15, }]}>
      {/* Name */}
      <Text numberOfLines={1} style={styles.personName}>
        {name.toLocaleUpperCase()}
      </Text>

      <SafeAreaView style={styles.flex_row_btw}>
        {/* Relation */}
        <SafeAreaView
          style={[
            styles.flex_row,
            { marginTop: 10, maxWidth: "50%" }
          ]}
        >
          <FontAwesome6 name="handshake-simple" color={textColor} size={14} />
          <Text numberOfLines={1} style={[styles.smallText, { color: textColor }]}>
            {relation}
          </Text>
        </SafeAreaView>

        {/* Contact Section */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.flex_row}
          onPress={() => Linking.openURL(`tel:${contact}`)}
        >
          <Text style={styles.personContact}>{contact.toString()}</Text>
          <Ionicons name="call" color={textColor} size={14} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default People;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    position: "relative",
  },
  flexText: {
    flexShrink: 1,
    minWidth: 50,
    maxWidth: "100%",
  },
  iconWrapper: {
    width: "auto",
  },
  peopleContainer: {
    height: "100%",
    marginTop: 15,
    paddingHorizontal: 15,
  },
  personCard: {
    paddingTop: 15,
    borderRadius: 15,
    marginBottom: 10,
    paddingBottom: 15,
  },
  cardBottom: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  personName: {
    fontSize: 14,
  },
  personContact: {
    fontSize: 14,
  },
  smallBox: {
    borderRadius: 30,
    padding: 7,
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  smallText: {
    fontSize: 12,
    fontWeight: 500,
  },
  addText: {
    fontWeight: 500,
    fontSize: 16,
    marginRight: 5,
  },
  flex_row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flex_row_btw: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
