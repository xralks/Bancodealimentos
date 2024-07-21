import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'react-native-image-picker';

export default function PrimerPaso({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [condition, setCondition] = useState(false);

  const handleSelectImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setAvatar(response.assets[0]);
      }
    });
  };

  const handleCompleteProfile = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      Alert.alert('Error', userError.message);
      return;
    }

    if (!fullName || !username || !avatar) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

  
    const { data: avatarData, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(`public/${user.id}_${Date.now()}.jpg`, { uri: avatar.uri, type: 'image/jpeg' });

    if (uploadError) {
      Alert.alert('Error', uploadError.message);
      return;
    }

   
    const avatarUrl = supabase.storage.from('avatars').getPublicUrl(avatarData.path).publicURL;

 
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, username, avatar_url: avatarUrl, condition })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Datos completados correctamente.');
      navigation.navigate('Home');
    }
  };

  const toggleSwitch = () => setCondition(previousState => !previousState);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Estás a un paso, solo rellena tus datos y estarás listo para navegar en nuestra app</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre Completo"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre de Usuario"
        value={username}
        onChangeText={setUsername}
      />
      <TouchableOpacity style={styles.imagePicker} onPress={handleSelectImage}>
        {avatar ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        ) : (
          <Text>Seleccionar Imagen</Text>
        )}
      </TouchableOpacity>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>
          {condition ? 'Soy Administrador' : 'Soy locatario'}
        </Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={condition ? "#77d353" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={condition}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleCompleteProfile}
      >
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#e0f7fa',
    borderColor: '#77d353',
  },
  imagePicker: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0f7fa',
    borderColor: '#77d353',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  button: {
    padding: 15,
    backgroundColor: '#77d353',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
  },
});
