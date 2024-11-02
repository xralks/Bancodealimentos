import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator , Image} from 'react-native';
import { supabase } from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Aceptadas = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const trueStockId = '02c87707-646a-45f1-a641-53d8278cb614';

  // Obtener el usuario actual
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

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../assets/publicacion.png')}
        style={styles.notpubli}
      />
      <Text style={styles.emptyText}>Aún no hay publicaciones aceptadas.</Text>
    </View>
  );

  
  useEffect(() => {
    if (userId) {
      async function fetchData() {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .in('aceptada', ['aceptada', 'institucionaceptada'])
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          if (data) {
            
            const updatedPosts = await Promise.all(
              data.map(async (post) => {
                const { data: postProductos, error: postProductosError } = await supabase
                  .from('post_productos')
                  .select('stock_id')
                  .eq('post_id', post.id);

                if (postProductosError) throw postProductosError;

                
                const hasTrueStock = postProductos.some((producto) => producto.stock_id === trueStockId);

                return { ...post, hasTrueStock };
              })
            );

            setPosts(updatedPosts);
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

  // Renderizar el ícono basado en el estado de la publicación
  const renderIcon = (hasTrueStock, isInstitucionAceptada) => {
    if (isInstitucionAceptada) {
      // Cambiar texto para publicaciones 'institucionaceptada'
      if (hasTrueStock) {
        return (
          <View style={styles.iconWithText}>
            <Icon name="check-circle" size={28} color="#3b911f" style={styles.checkButton} />
            <Text style={styles.statusText}>Productos recibidos</Text>
          </View>
        );
      } else {
        return (
          <View style={styles.iconWithText}>
            <Icon name="progress-clock" size={28} color="#ff9f00" style={styles.checkButton} />
            <Text style={styles.statusText}>Puedes realizar el retiro</Text>
          </View>
        );
      }
    } else {
      // Texto para otras publicaciones (que no son 'institucionaceptada')
      if (hasTrueStock) {
        return (
          <View style={styles.iconWithText}>
            <Icon name="check-circle" size={28} color="#3b911f" style={styles.checkButton} />
            <Text style={styles.statusText}>Producto retirado</Text>
          </View>
        );
      } else {
        return (
          <View style={styles.iconWithText}>
            <Icon name="progress-clock" size={28} color="#ff9f00" style={styles.checkButton} />
            <Text style={styles.statusText}>Retiro en camino</Text>
          </View>
        );
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.createdAt}>{new Date(item.created_at).toLocaleString()}</Text>
      <View style={styles.iconContainer}>
        <Text style={styles.estado}>Estado:</Text>
        {renderIcon(item.hasTrueStock, item.aceptada === 'institucionaceptada')}
      </View>
    </View>
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
    color: '#0f290a',
  },
  content: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  estado: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '600',
  },
  createdAt: {
    fontSize: 14,
    color: '#254b1c',
    marginBottom: 5,
  },
  checkButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWithText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 11,
    color: '#333',
    fontWeight: '600',
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

export default Aceptadas;
