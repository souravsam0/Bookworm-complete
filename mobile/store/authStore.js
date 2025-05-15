import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from "zustand";
import { API_URL } from "../constants/api.js";

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true,
    isOtpSent: false,
    phoneNumber: null,

    // Step 1: Request OTP
    requestOtp: async (phoneNumber) => {
        set({isLoading: true});
        try {
            // Normalize phone number
            const normalizedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '');
            
            console.log(`Requesting OTP for: ${normalizedPhone}`);
            
            const response = await fetch(`${API_URL}/auth/request-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({phone: normalizedPhone}),
            });

            const data = await response.json();
            console.log("Request OTP response:", data);

            if(!response.ok){
                throw new Error(data.message || "Failed to send OTP");
            }

            set({isOtpSent: true, phoneNumber: normalizedPhone, isLoading: false});

            return {
                success: true
            };
        } catch (error) {
            console.error("Request OTP error:", error);
            set({isLoading: false});
            return {success: false, error: error.message};
        }
    },

    // Step 2: Verify OTP
    verifyOtp: async (otp) => {
        set({isLoading: true});
        try {
            const phoneNumber = get().phoneNumber;
            
            if (!phoneNumber) {
                throw new Error("Phone number not found. Please request OTP first.");
            }
            
            console.log(`Verifying OTP for ${phoneNumber}: ${otp}`);
            
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({phone: phoneNumber, otp}),
            });

            const data = await response.json();
            console.log("Verify OTP response:", data);

            if(!response.ok){
                throw new Error(data.message || "Invalid OTP");
            }

            if (!data.token || !data.user) {
                throw new Error("Invalid response from server");
            }

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({
                token: data.token, 
                user: data.user, 
                isLoading: false,
                isOtpSent: false,
                phoneNumber: null
            });

            return {
                success: true
            };
        } catch (error) {
            console.error("Verify OTP error:", error);
            set({isLoading: false});
            return {success: false, error: error.message};
        }
    },

    // Reset OTP verification state
    resetOtpState: () => {
        set({isOtpSent: false, phoneNumber: null});
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");   
            const user = userJson ? JSON.parse(userJson) : null;
    
            // Validate token by checking if it exists and user exists
            if (token && user) {
                console.log("Found stored credentials");
                set({token, user});
            } else {
                console.log("No valid stored credentials");
                // Clear incomplete auth data
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("user");
                set({token: null, user: null});
            }
        } catch (error) {
            console.log("Auth check failed", error);
            // Clear potentially corrupted auth data
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            set({token: null, user: null});
        } finally {
            set({isCheckingAuth: false});
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            set({token: null, user: null});
            console.log("Logout successful");
        } catch (error) {
            console.error("Logout error:", error);
        }
    },
}));