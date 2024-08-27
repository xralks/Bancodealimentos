import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Ubicaciones = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchAcceptedPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts') 
          .select('id, title, content, user_id')
          .eq('aceptada', 'aceptada') 
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const postIds = data.map(post => post.id);

        if (postIds.length > 0) {
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('id, title, content, user_id')
            .in('id', postIds);

          if (postsError) {
            throw postsError;
          }

          const locationsData = await Promise.all(postsData.map(async (post) => {
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
        console.error('Error fetching accepted posts:', error.message);
        setIsLoading(false);
      }
    };

    fetchAcceptedPosts();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e175" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.address}>{item.direccion}</Text>
        </View>
        <TouchableOpacity style={styles.checkButton}>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
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
});

export default Ubicaciones;
