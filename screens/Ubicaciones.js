import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Ubicaciones = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  const[origin, setOrigin]= React.useState({
    latitude: -33.483500,  // Destino
    longitude: -70.684200,
  });
  const [destination, setDestination] = React.useState({
    latitude: -33.48297530262276, 
    longitude:-70.68298352795183,
  });

  const fetchAcceptedPosts = async () => {
    try {
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, content, user_id')
        .eq('aceptada', 'aceptada');

      if (postsError) {
        throw postsError;
      }

      if (posts.length > 0) {
        
        const { data: postProducts, error: postProductsError } = await supabase
          .from('post_productos')
          .select('post_id, stock_id')
          .eq('stock_id', '3c5b1444-7b0c-4d87-a129-ee0e95f76586'); // stock en TRUE

        if (postProductsError) {
          throw postProductsError;
        }

        
        const filteredPosts = posts.filter(post => 
          postProducts.some(pp => pp.post_id === post.id)
        );

        const locationsData = await Promise.all(filteredPosts.map(async (post) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('direccion')
            .eq('id', post.user_id)
            .single();

          if (profileError) {
            throw profileError;
          }

          return {
            ...post,
            direccion: profileData.direccion,
          };
        }));

        setLocations(locationsData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener publicaciones aceptadas:', error.message);
      setIsLoading(false);
    }
  };
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../assets/notlocacion.png')}
        style={styles.notpubli}
      />
      <Text style={styles.emptyText}>Aún no hay ubicaciones.</Text>
    </View>
  );

  useEffect(() => {
    fetchAcceptedPosts();
  }, []);

  const handleCheckPress = (postId) => {
    Alert.alert(
      'Confirmación',
      '¿Fue recogido el producto correctamente?, si es asi selecciona aceptar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            try {
              
              const { data, error } = await supabase
                .from('post_productos')
                .select('stock_id')
                .eq('post_id', postId);

              if (error) {
                throw error;
              }

              const falseStockId = '3c5b1444-7b0c-4d87-a129-ee0e95f76586'; // ID para FALSE
              const trueStockId = '02c87707-646a-45f1-a641-53d8278cb614'; // ID para TRUE
              
              
              const newStockId = data[0].stock_id === falseStockId ? trueStockId : falseStockId;

              
              const { error: updateError } = await supabase
                .from('post_productos')
                .update({ stock_id: newStockId })
                .eq('post_id', postId);

              if (updateError) {
                throw updateError;
              }

              Alert.alert('Éxito', 'Los productos han sido agregados correctamente al stock.');
              
              
              fetchAcceptedPosts();
            } catch (error) {
              console.error('Error al actualizar el stock:', error.message);
              Alert.alert('Error', 'No se pudo actualizar el estado del stock.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.address}>{item.direccion}</Text>
        </View>
        <TouchableOpacity style={styles.checkButton} onPress={() => handleCheckPress(item.id)}>
          <Icon name="check" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => navigation.navigate('PublicacionA', { itemId: item.id })}
        >
          <Icon name="eye" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e175" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        keyExtractor={item => item.id.toString()}
      />
        <View style={styles.containermap}>
          <MapView style={styles.map}
          initialRegion={{
            latitude: origin.latitude,
            longitude: origin.longitude,
            latitudeDelta: 0.008,
            longitudeDelta:0.008
          }}
          >
          <Marker coordinate={origin} title="Origen" description="Este es el punto de inicio" />
          <Marker coordinate={destination} title="destino" description="Este es el punto de destino" />
          </MapView>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    color: '#555',
  },
  checkButton: {
    backgroundColor: '#4caf50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  eyeButton: {
    backgroundColor: '#2f6f1c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containermap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map:{
    width:'70%',
    height:'90%',
    marginBottom: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notpubli: {
    width:100,
    height:100,
  },
  emptyText: {
    fontSize: 18,
    color: '#254b1c',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Ubicaciones;