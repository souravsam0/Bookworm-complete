import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator
} from "react-native";
import styles from "../../assets/styles/login.styles";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const {isCheckingAuth, isLoading, requestOtp, verifyOtp, isOtpSent} = useAuthStore();

  const handleRequestOtp = async () => {
    // Simple validation for phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    const result = await requestOtp(phoneNumber);

    if (!result.success) {
      Alert.alert("Error", result.error);
    } else {
      Alert.alert("Success", "OTP sent to your phone number");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Error", "Please enter a valid OTP");
      return;
    }

    const result = await verifyOtp(otp);

    if (!result.success) {
      Alert.alert("Error", result.error);
    }
  };

  if (isCheckingAuth) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.topIllustration}>
          <Image
            source={require("../../assets/images/i.png")}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.card}>
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Bookworm🦦</Text>
              <Text style={styles.subtitle}>Login with your phone number</Text>
            </View>
            
            {/* Phone Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={COLORS.placeholderText}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  editable={!isOtpSent}
                />
              </View>
            </View>

            {/* OTP Input (only shown after OTP is sent) */}
            {isOtpSent && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>OTP Code</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP code"
                    placeholderTextColor={COLORS.placeholderText}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>
            )}

            {!isOtpSent ? (
              <TouchableOpacity
                style={styles.button}
                onPress={handleRequestOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleRequestOtp}
                  disabled={isLoading}
                >
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}