import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { supabase } from '../lib/supabase';
import CustomPicker from '../components/CustomPicker';

export default function PrimerPaso({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [direccion, setDireccion] = useState('');
  const [patio, setPatio] = useState('Seleccione patio');
  const [calle, setCalle] = useState('Seleccione calle');
  const [local, setLocal] = useState('Seleccione local');
  const [userType, setUserType] = useState('Seleccione condición');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

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
        <CustomPicker
          selectedValue={userType}
          onValueChange={setUserType}
          options={[
            { label: "Seleccione condición", value: "Seleccione condición" },
            { label: "Locatario", value: "Locatario" },
            { label: "Institución", value: "Institución" },
            { label: "Administrador", value: "Administrador" },
          ]}
        />
        {userType === 'Locatario' && (
          <Image source={require('../assets/mapa.jpeg')} style={styles.mapImage} />
        )}
        {userType === 'Locatario' && (
          <>
            <Text style={styles.welcomeText}>
            Selecciona tu ubicación: indícanos en qué patio, calle y local te encuentras.
            </Text>
            <CustomPicker
              selectedValue={patio}
              onValueChange={setPatio}
              options={[
                { label: "Seleccione patio", value: "Seleccione patio" },
                { label: "Patio Papas", value: "Patio Papas" },
                { label: "Patio Norte", value: "Patio Norte" },
                { label: "Patio Uno", value: "Patio Uno" },
              ]}
            />
            <CustomPicker
              selectedValue={calle}
              onValueChange={setCalle}
              options={[
                { label: "Seleccione calle", value: "seleccionecalle" },
                { label: "Calle 10 (Siberia)", value: "calle10siberia1" },
                { label: "Calle 16", value: "calle16" },
                { label: "Calle La Rural", value: "callelarural1" },
                { label: "Calle 15 sur", value: "calle15sur" },
                { label: "Calle 5 sur", value: "calle5sur" },
                { label: "Calle 1 Norte", value: "calle1norte1" },
                { label: "Calle 2 norte", value: "calle2norte" },
                { label: "Calle 5 oriente", value: "calle5oriente1" },
                { label: "Calle 11 norte", value: "calle11norte1" },
                { label: "Calle 7 oriente", value: "calle7oriente1" },
                { label: "Calle 15 Norte", value: "calle15norte1" },
                { label: "Calle 3 Norte", value: "calle3norte" },
                { label: "Calle 6 Norte", value: "calle6norte" },
                { label: "Calle 5 oriente", value: "calle5oriente2" },
                { label: "Calle 10 (Siberia)", value: "calle10siberia2" },
                { label: "Calle 13", value: "calle13" },
                { label: "Calle 14", value: "calle14" },
                { label: "Calle 7 oriente", value: "calle7oriente2" },
                { label: "Calle 8 Oriente", value: "calle8oriente" },
                { label: "Calle 12", value: "calle12" },
                { label: "Calle 5 norte", value: "calle5norte" },
                { label: "Calle 11 Norte", value: "calle11norte2" },
                { label: "Calle 9 oriente", value: "calle9oriente" },
                { label: "Calle 4 Poniente", value: "calle4poniente1" },
                { label: "Calle 4 Poniente", value: "calle4poniente2" },
                { label: "Calle 9 Poniente", value: "calle9poniente" },
                { label: "Calle 10 (Siberia)", value: "calle10siberia3" },
                { label: "Calle Principal 1", value: "calleprincipal1" },
                { label: "Calle Principal 2", value: "calleprincipal2" },
                { label: "Calle Principal 3", value: "calleprincipal3" },
                { label: "Calle La Rural", value: "callelarural2" },
                { label: "Calle 1 Norte", value: "calle1norte2" },
                { label: "Calle 15 Norte", value: "calle15norte2" },
              ]}
            />
            <CustomPicker
              selectedValue={local}
              onValueChange={setLocal}
              options={[
                { label: "Seleccione local", value: "Seleccione local" },
                { label: "Local 101", value: "Local 101" },
                { label: "Local 102", value: "Local 102" },
              ]}
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
    backgroundColor: '#fff',
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
