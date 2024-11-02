import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const MisPublicaciones = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      async function fetchData() {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          if (data) {
            setPosts(data);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error fetching posts:', error.message);
          setIsLoading(false); 
        }
      }

      fetchData();
    }
  }, [userId]);

  const handleDelete = (postId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta publicación?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              
              const { error: deletePostProductosError } = await supabase
                .from('post_productos')
                .delete()
                .eq('post_id', postId);

              if (deletePostProductosError) {
                throw deletePostProductosError;
              }

              
              const { error: deletePostError } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);
              
              if (deletePostError) {
                throw deletePostError;
              }

              
              setPosts(posts.filter(post => post.id !== postId));
            } catch (error) {
              console.error('Error deleting post:', error.message);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
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
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Informacion', { itemId: item.id })}
    >
      <Image
        source={require('../assets/postIma.jpg')}
        style={styles.image}
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.createdAt}>{new Date(item.created_at).toLocaleString()}</Text>
  
      {item.aceptada === 'aceptada' || item.aceptada === 'institucionaceptada' ? (
        <Text style={styles.acceptedText}>Esta publicación ya fue aceptada. Para consultar su estado, dirígete a la sección de <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Aceptadas')}>
        <Text style={styles.registerText}>Estado de publicaciones</Text>
        </TouchableOpacity></Text>
      ) : (
        <>
          <TouchableOpacity 
            style={styles.navButtonElim}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.navButtonText}>Eliminar publicación</Text>
          </TouchableOpacity>
        </>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#77d353" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color:'#0f290a',
  },
  content: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  createdAt: {
    fontSize: 14,
    color: '#254b1c',
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  navButtonElim: {
    backgroundColor: '#ed4646',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 5,
  },
  navButtonEdit: {
    backgroundColor: '#77d353',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  acceptedText: {
    color: '#10290a',
    marginTop: 10,
    fontWeight: '500',
    fontSize: 14,
  },
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    marginTop: 5,
    color: '#77d353',
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

export default MisPublicaciones;
