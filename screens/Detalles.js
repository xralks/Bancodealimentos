import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image } from 'react-native';
import { supabase } from '../lib/supabase';

const Detalles = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntregaProducts = async () => {
    try {
      const { data: entregaData, error } = await supabase
        .from('entrega_product')
        .select(`
          cantidad_donada,
          nombre_fundacion,
          fecha_creacion,
          productos:producto_id (
            nombrep,
            descripcion
          )
        `);

      if (error) throw error;

      setData(entregaData);
    } catch (error) {
      console.error('Error fetching entrega_product:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../assets/notlista.png')}
        style={styles.notpubli}
      />
      <Text style={styles.emptyText}>Aún no hay donaciones creadas.</Text>
    </View>
  );
  useEffect(() => {
    fetchEntregaProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e175" />
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    const productName = item.productos ? item.productos.nombrep : 'Producto no disponible';
    const productDescription = item.productos ? item.productos.descripcion : 'Descripción no disponible';
    const createdAt = item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleString() : 'Fecha no disponible';

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>Donación N° {index + 1}</Text>
        <Text style={styles.itemText}>Nombre Fundación: {item.nombre_fundacion}</Text>
        <Text style={styles.itemText}>Cantidad Donada: {item.cantidad_donada} KG</Text>
        <Text style={styles.itemText}>Producto: {productName}</Text>
        <Text style={styles.itemText}>Tipo de producto: {productDescription}</Text>
        <Text style={styles.itemText}>Fecha: {createdAt}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyComponent}
      keyExtractor={(item, index) => index.toString()} // tengo que modificar para que haya mas de euna donación al igual que en Lista.js
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#f0fbea',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color:'#0f290a',
  },
  itemText: {
    fontSize: 16,
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

export default Detalles;
