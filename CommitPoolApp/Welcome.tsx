import * as React from "react";
import {
View,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";

export default class Welcome extends React.Component<
  { next: any; code: string },
  {}
> {
  render() {
    return (
      <LinearGradient
        colors={["#D45353", "#D45353", "white"]}
        style={styles.linearGradient}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ textAlign: "center", color: "white", fontSize: 30, marginBottom: 25 }}>
              {"Hey there,"}
              {"\n"}
              {"You have personal goals, but sticking to them is hard."}
              {"\n"}
              {"CommitPool is here to help you hold yourself accountable! 💪"}
            </Text>
            <Text style={{ textAlign: "center", color: "white", fontSize: 25, marginBottom: 5 }}>
              {"Here's how it works:"}
            </Text>
            <Text style={{ textAlign: "left", color: "white", fontSize: 20, marginBottom: 25 }}>
              
              {"\n"}
              {"1. Set a goal for yourself"}
              {"\n"}
              {"2. Stake some money on that goal to make it a real commitment"}
              {"\n"}
              {"3. Get going on your goal!"}
              {"\n"}
              {"\n"}
              {"When you complete your goal, you get your money back. 🎉"}
              {"\n"}
              {"But if you come up short of your goal, you lose your stake. 😬"}
            </Text>
            <Text style={{ fontStyle: "italic", textAlign: "center", color: "white", fontSize: 25, marginBottom: 0 }}>
              {"For example:"}
              </Text>
            <Text
              style={{
                fontStyle: "italic",
                textAlign: "center",
                color: "white",
                fontSize: 20,
                marginBottom: 15
              }}
            >
              
              {"\n"}
              {"My goal is to bike 50 miles in the next week"}
              {"\n"}
              {"and I'm staking $10 on my succes"}
            </Text>
          </View>
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() => this.props.next(2)}
          >
            <Image
              style={{ width: 100, height: 100 }}
              source={require("./assets/commit.png")}
            />
            <Text style={{ color: "#D45353", fontSize: 40 }}>
              Ready to commit? 
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width,
    height,
    borderRadius: 5,
  },
});
