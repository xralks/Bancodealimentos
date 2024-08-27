import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList, RefreshControl, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeA({ navigation }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tipo, settipo] = useState(null);
  const [numPosts, setNumPosts] = useState(0);
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setUserId(user.id);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url, tipo')
          .eq('id', user.id)
          .single();

        if (profileError) {
          Alert.alert('Error', profileError.message);
        } else {
          setUsername(data.username);
          setFullName(data.full_name);
          setAvatarUrl(data.avatar_url);
          settipo(data.tipo);
          fetchPosts(user.id);
          fetchPostsCount(user.id);
        }
      }
    };

    const fetchPosts = async (userId) => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(full_name, tipo)')
        .neq('user_id', userId)
        .eq('aceptada', 'no aceptada') 
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
        .neq('user_id', userId)
        .eq('aceptada', 'no aceptada');  

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setNumPosts(count);
      }
    };

    fetchProfile();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(full_name, tipo)')
        .neq('user_id', userId)
        .eq('aceptada', 'no aceptada') 
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToAddPost = () => {
    navigation.navigate('AgregarAdmin');
  };

  const navigateToPublicacion = (itemId) => {
    navigation.navigate('PublicacionA', { itemId });
  };

  const renderPost = ({ item }) => {
    return (
      <TouchableOpacity style={styles.postItem} onPress={() => navigateToPublicacion(item.id)}>
        <Image
          source={require('../assets/postIma.jpg')}
          style={styles.publcimg}
        />
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>
        <Text style={styles.postAuthor}>Publicado por: {item.profiles.full_name}</Text>
        <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        <View style={styles.badgeContainer}>
          {item.profiles.tipo === 'Institución' ? (
            <View style={styles.institutionBadge}>
              <Text style={styles.badgeText}>Institución</Text>
            </View>
          ) : (
            <View style={styles.locatarioBadge}>
              <Text style={styles.badgeText}>Locatario</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/BANCO-DE-ALIMENTOS-6.jpg')}
          style={styles.image}
        />
        <TouchableOpacity style={styles.addButton} onPress={navigateToAddPost}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.profileContainer}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.profilePicture}
          />
        ) : (
          <Image
            source={require('../assets/perfil.jpeg')}
            style={styles.profilePicture}
          />
        )}
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.condition}>Administrador</Text>
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>{posts.length} Publicaciones Disponibles</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        style={styles.postsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchData}
          />
        }
      />
      <View style={styles.navContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Misdatos')}>
        <Icon name="account-outline" size={28} color="#3b911f" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MyPublication')}>
        <Icon name="format-list-bulleted" size={28} color="#3b911f" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}onPress={() => navigation.navigate('Ubicaciones')}>
        <Icon name="map-marker" size={28} color="#3b911f" />
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
    height: 130,
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
  condition: {
    fontWeight: '500',
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
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f290a',
  },
  postContent: {
    fontSize: 16,
    marginTop: 5,
  },
  postAuthor: {
    fontSize: 14,
    color: '#254b1c',
    marginTop: 5,
  },
  postDate: {
    fontSize: 12,
    color: '#0f290a',
    marginTop: 5,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderRadius: 12,
    borderColor: '#ddd',
    paddingVertical: 10,
    backgroundColor: '#beeea8',
    height: Platform.OS === 'ios' ? 60 : 50,
    bottom: 0,
  },
  navButton: {
    alignItems: 'center',
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
  publcimg: {
    width: '100%',
    height: 130,
    marginBottom: 10,
    borderRadius: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 5,
    justifyContent: 'flex-start',
  },
  institutionBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 5,
  },
  locatarioBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
