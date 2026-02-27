import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReferralCode = (fullName: string) => {
    const prefix = fullName.replace(/\s/g, '').substring(0, 4).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      // Validate Referral Code if present
      let referredBy = null;
      if (referralCode.trim()) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("referralCode", "==", referralCode.trim()));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          referredBy = snapshot.docs[0].id; // The User ID of the referrer
        } else {
          Alert.alert("Código inválido", "El código de referido no existe. Puedes continuar sin él o corregirlo.");
          setLoading(false);
          return;
        }
      }

      // Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: name,
      });

      // Generate own referral code
      const myReferralCode = generateReferralCode(name);

      // Create user document in Firestore with referral data
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: name,
        email: email,
        roles: ["user"],
        membershipType: "free",
        joinDate: new Date().toISOString(),
        isAlly: false,
        allyStatus: "none",
        createdAt: new Date().toISOString(),
        referralCode: myReferralCode,
        referredBy: referredBy, // The ID of the person who invited me
        referralCommissionPaid: false // Flag to track if the reward has been paid
      });

      Alert.alert('Éxito', '¡Cuenta creada correctamente!');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error de registro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete al ecosistema NodoX</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre Completo"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[styles.input, styles.optionalInput]}
          placeholder="Código de Referido (Opcional)"
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  optionalInput: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#2563eb',
    textAlign: 'center',
    fontSize: 14,
  },
});
