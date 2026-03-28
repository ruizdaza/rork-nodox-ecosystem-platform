import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

interface NodoXLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

export default function NodoXLogo({ size = 'medium', showText = true, style }: NodoXLogoProps) {
  const logoSize = {
    small: 24,
    medium: 32,
    large: 48,
  }[size];

  const textSize = {
    small: 12,
    medium: 16,
    large: 20,
  }[size];

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/7ksxxaexqfm16d77a4moc' }}
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.text, { fontSize: textSize }]}>NodoX</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    // Image dimensions will be set by props
  },
  text: {
    fontWeight: '700',
    color: '#1e293b',
  },
});