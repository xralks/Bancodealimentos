import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Home({ navigation }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [condition, setCondition] = useState(null);
  const [numPosts, setNumPosts] = useState(0);
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setUserId(user.id);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, condition')
          .eq('id', user.id)
          .single();

        if (profileError) {
          Alert.alert('Error', profileError.message);
        } else {
          setUsername(data.username);
          setFullName(data.full_name);
          setCondition(data.condition);
          fetchPosts(user.id);
          fetchPostsCount(user.id);
        }
      }
    };

    const fetchPosts = async (userId) => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(full_name)')
        .neq('user_id', userId)  // Obtener publicaciones que no sean del usuario actual
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setPosts(data);
      }
    };

    const fetchPostsCount = async (userId) => {
      const { count, error } = await supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId); // Contar publicaciones del usuario actual

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setNumPosts(count);
      }
    };

    fetchProfile();
  }, []);

  const navigateToMyPublications = () => {
    navigation.navigate('MyPublication');
  };

  const navigateToMyData = () => {
    navigation.navigate('Misdatos');
  };

  const navigateToAddPost = () => {
    navigation.navigate('Agregar');
  };

  const renderPost = ({ item }) => (
    <View style={styles.postItem}>
      <Image
        source={require('../assets/postIma.jpg')}
        style={styles.publcimg}
      />
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      <Text style={styles.postAuthor}>Publicado por: {item.profiles.full_name}</Text>
      <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/porciones.jpg')}
          style={styles.image}
        />
        <TouchableOpacity style={styles.addButton} onPress={navigateToAddPost}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.profileContainer}>
        <Image
          source={require('../assets/perfil.jpeg')}
          style={styles.profilePicture}
        />
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.condition}>{condition ? 'Vendedor' : 'Locatario'}</Text>
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>{numPosts} Mis Publicaciones</Text>
        <Text style={styles.statsText}>0 Enviadas</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        style={styles.postsList}
      />
      <View style={styles.navContainer}>
        <TouchableOpacity style={styles.navButton} onPress={navigateToMyData}>
          <Text style={styles.navButtonText}>Mis datos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={navigateToMyPublications}>
          <Text style={styles.navButtonText}>Mis Publicaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Aceptadas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#000',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    color: 'gray',
  },
  condition: {
    color: '#000',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
  },
  statsText: {
    fontSize: 16,
  },
  postsList: {
    width: '100%',
  },
  postItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postContent: {
    fontSize: 16,
    marginTop: 5,
  },
  postAuthor: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  postDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#77d353',
  },
  addButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#77d353',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  publcimg:{
      width: '100%',
      height: 130,
      marginBottom: 10,
  }
});
