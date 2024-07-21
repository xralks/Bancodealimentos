import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView, Platform, KeyboardAvoidingView, Modal, TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';

export default function PrimerPaso({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [direccion, setDireccion] = useState('');
  const [patio, setPatio] = useState('');
  const [calle, setCalle] = useState('');
  const [local, setLocal] = useState('');
  const [userType, setUserType] = useState('Seleccione condición');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const fetchUserId = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      Alert.alert('Error', 'No se pudo obtener el usuario: ' + error.message);
    } else {
      setUserId(user.id);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  const handleCompleteProfile = async () => {
    try {
      setLoading(true);

      if (!userId) {
        Alert.alert('Error', 'No se ha obtenido el ID del usuario.');
        return;
      }

      let finalDireccion = direccion;
      if (userType === 'Locatario') {
        finalDireccion = `${patio}, ${calle}, ${local}`;
      } else if (userType === 'Administrador') {
        finalDireccion = 'Lo Valledor';
      }

      if (!fullName || !username || !finalDireccion || userType === 'Seleccione condición') {
        Alert.alert('Error', 'Todos los campos son obligatorios.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName, 
          username, 
          direccion: finalDireccion,
          tipo: userType 
        })
        .eq('id', userId);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Éxito', 'Datos completados correctamente.');
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error in handleCompleteProfile:', error);
      Alert.alert('Error', 'Algo salió mal. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.welcomeText}>
          ¡Perfecto! Estás a un paso de poder navegar y disfrutar de la app Banco de Alimentos. 
          Solo rellena los datos y estarás listo.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre Completo Locatario o Nombre Institución"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre de Usuario"
          value={username}
          onChangeText={setUsername}
        />
        {Platform.OS === 'ios' ? (
          <>
            <TouchableOpacity style={styles.pickerContainer} onPress={() => setPickerVisible(true)}>
              <Text style={[styles.pickerLabel, userType === 'Seleccione condición' && { color: '#aaa' }]}>{userType}</Text>
            </TouchableOpacity>
            <Modal
              visible={pickerVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setPickerVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setPickerVisible(false)}>
                <View style={styles.modalBackdrop} />
              </TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={userType}
                    style={styles.picker}
                    onValueChange={(itemValue) => {
                      setUserType(itemValue);
                      setPickerVisible(false);
                    }}
                  >
                    <Picker.Item label="Seleccione condición" value="Seleccione condición" />
                    <Picker.Item label="Locatario" value="Locatario" />
                    <Picker.Item label="Institución" value="Institución" />
                    <Picker.Item label="Administrador" value="Administrador" />
                  </Picker>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={userType}
              style={styles.androidPicker}
              onValueChange={(itemValue) => setUserType(itemValue)}
            >
              <Picker.Item label="Seleccione condición" value="Seleccione condición" />
              <Picker.Item label="Locatario" value="Locatario" />
              <Picker.Item label="Institución" value="Institución" />
              <Picker.Item label="Administrador" value="Administrador" />
            </Picker>
          </View>
        )}
        {userType === 'Locatario' && (
          <Image source={require('../assets/mapa.jpeg')} style={styles.mapImage} />
        )}
        {userType === 'Locatario' && (
          <>
            <Text style={styles.welcomeText}>
            Selecciona tu ubicación: indícanos en qué patio, calle y local te encuentras.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Patio"
              value={patio}
              onChangeText={setPatio}
            />
            <TextInput
              style={styles.input}
              placeholder="Calle"
              value={calle}
              onChangeText={setCalle}
            />
            <TextInput
              style={styles.input}
              placeholder="Local"
              value={local}
              onChangeText={setLocal}
            />
          </>
        )}
        {userType === 'Institución' && (
          <TextInput
            style={styles.input}
            placeholder="Dirección de la institución"
            value={direccion}
            onChangeText={setDireccion}
          />
        )}
        {userType === 'Administrador' && (
          <TextInput
            style={[styles.input, { backgroundColor: '#f0f0f0' }]}
            placeholder="Dirección"
            value="Lo Valledor"
            editable={false}
          />
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleCompleteProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#77d353',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#e0f7fa',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#77d353',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    paddingVertical: 10, 
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 10, 
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  pickerWrapper: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  picker: {
    width: '100%',
    height: 200,
  },
  androidPicker: {
    height: 40,  
    justifyContent: 'center',
  },
  mapImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#77d353',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
