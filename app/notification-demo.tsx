import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { NotificationDemo } from '@/components/NotificationDemo';

export default function NotificationDemoPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Demo de Notificaciones',
          headerShown: true,
          presentation: 'modal'
        }} 
      />
      <View style={styles.content}>
        <NotificationDemo />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
});