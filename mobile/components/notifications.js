import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.log('Must use physical device for notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token!');
    return null;
  }

  try {
    // Modify the token fetch to use environment variable
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID
    });
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuthStore();

  useEffect(() => {
    const updateToken = async () => {
      try {
        const token = await registerForPushNotifications();
        if (!token || !user?.token) return;

        await fetch('/api/auth/update-expo-token', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ expoPushToken: token.data }),
        });
      } catch (error) {
        console.error('Error updating Expo token:', error);
      }
    };

    updateToken();
  }, [user]);

  // Handle received notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // You can add state updates here for UI notifications
    });

    return () => subscription.remove();
  }, []);

  return children;
};