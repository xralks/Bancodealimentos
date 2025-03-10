import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList, RefreshControl, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';

export default function Home({ navigation }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tipo, setTipo] = useState(null);
  const [numPosts, setNumPosts] = useState(0);
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptedPostsCount, setAcceptedPostsCount] = useState(0);

  useEffect(() => {
    fetchProfile().catch(error => console.error('Error in fetchProfile:', error));
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      setUserId(user.id);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, tipo')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setUsername(data.username);
      setFullName(data.full_name);
      setAvatarUrl(data.avatar_url);
      setTipo(data.tipo);

      await Promise.all([
        fetchPosts(user.id, data.tipo),
        fetchPostsCount(user.id),
        data.tipo === 'Locatario' ? fetchAcceptedPostsCount(user.id) : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      Alert.alert('Error', error.message);
    }
  };

  const fetchPosts = async (userId, userTipo) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(full_name, tipo)')
        .neq('user_id', userId)
        .eq('profiles.tipo', 'Administrador')
        .eq('dirigido', userTipo === 'Institución')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const filteredPosts = data.filter(post => post && post.profiles);
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      Alert.alert('Error', 'Failed to fetch posts');
    }
  };

  const fetchPostsCount = async (userId) => {
    try {
      const { count, error } = await supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      if (error) throw error;

      setNumPosts(count);
    } catch (error) {
      console.error('Error in fetchPostsCount:', error);
      Alert.alert('Error', 'Failed to fetch posts count');
    }
  };

  const fetchAcceptedPostsCount = async (userId) => {
    try {
      // Primero, obtenemos los post_id de post_productos
      const { data: postProductos, error: postProductosError } = await supabase
        .from('post_productos')
        .select('post_id')
        .eq('stock_id', '02c87707-646a-45f1-a641-53d8278cb614');

      if (postProductosError) throw postProductosError;

      // Extraemos los post_id en un array
      const postIds = postProductos.map(item => item.post_id);

      // Ahora, contamos los posts aceptados que coinciden con estos post_id
      const { count, error } = await supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('aceptada', 'aceptada')
        .in('id', postIds);

      if (error) throw error;

      setAcceptedPostsCount(count || 0);
    } catch (error) {
      console.error('Error in fetchAcceptedPostsCount:', error);
      Alert.alert('Error', 'Failed to fetch accepted posts count');
    }
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      await fetchProfile();
    } catch (error) {
      console.error('Error in fetchData:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../assets/publicacion.png')}
        style={styles.notpubli}
      />
      <Text style={styles.emptyText}>Aún no hay publicaciones.</Text>
    </View>
  );

  const navigateToMyPublications = () => {
    navigation.navigate('MyPublication');
  };

  const navigateToMyData = () => {
    navigation.navigate('Misdatos');
  };

  const navigateToAddPost = () => {
    if (tipo === 'Institución') {
      navigation.navigate('AgregarInstitucion');
    } else {
      navigation.navigate('AgregarLocatario');
    }
  };

  const navigateToPublicacion = (itemId) => {
    navigation.navigate('Publicacion', { itemId });
  };

  const renderPost = ({ item }) => {
    if (!item || !item.profiles) {
      return null;
    }

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
          {item.profiles.tipo === 'Administrador' && (
            <View style={styles.adminBadge}>
              <Text style={styles.badgeText}>Administrador</Text>
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
          source={tipo === 'Institución' ? require('../assets/institucion.jpg') : require('../assets/porciones.jpg')}
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
        <Text style={styles.condition}>{tipo === 'Institución' ? 'Institución' : 'Locatario'}</Text>
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>{numPosts} Mis Publicaciones</Text>
        <Text style={styles.statsText}>
          {tipo === 'Institución' ? '0 Recibidas' : `${acceptedPostsCount} Donaciones`}
        </Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        ListEmptyComponent={renderEmptyComponent}
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
          <Icon name="file-document" size={28} color="#3b911f" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Aceptadas')}>
          <Icon name="check-circle" size={28} color="#3b911f" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}onPress={() => navigation.navigate('Contacto')}>
        <Icon name="format-list-bulleted" size={28} color="#3b911f" />
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
  adminBadge: {
    backgroundColor: '#007bff',
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
