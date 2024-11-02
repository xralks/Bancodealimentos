import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import CustomPicker from '../components/CustomPicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomButton = ({ title, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabledButton]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const CustomButton2 = ({ title, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.button2, disabled && styles.disabledButton]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const AlimentosList = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [productosAgrupados, setProductosAgrupados] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(null);
  const [selectedInstitutionName, setSelectedInstitutionName] = useState('');

  const fetchInstitutions = async () => {
    try {
      const { data: institutionsData, error: institutionsError } = await supabase
        .from('posts')
        .select('user_id, profiles!inner (full_name)')
        .eq('aceptada', 'institucionaceptada');
  
      if (institutionsError) throw institutionsError;
  
      // Procesa las instituciones y filtra las duplicadas por nombre
      const processedInstitutions = institutionsData.map(inst => ({
        id: inst.user_id,
        nombre: inst.profiles.full_name.trim(),
      }));
  
      // Eliminar duplicados basados en el nombre de la institución
      const uniqueInstitutions = processedInstitutions.filter((inst, index, self) =>
        index === self.findIndex((i) => i.nombre === inst.nombre)
      );
  
      setInstitutions(uniqueInstitutions);
    } catch (error) {
      console.error('Error fetching institutions:', error.message);
    }
  };

  const fetchAlimentos = async () => {
    try {
      const { data: postProductosData, error: postProductosError } = await supabase
        .from('post_productos')
        .select(`
          post_id,
          cantidadp,
          productos_id,
          productos:productos_id (
            id,
            nombrep,
            descripcion
          ),
          stock!inner(
            id,
            bodega
          )
        `)
        .eq('stock.bodega', true);

      if (postProductosError) throw postProductosError;

      const { data: entregaProductData, error: entregaProductError } = await supabase
        .from('entrega_product')
        .select('producto_id, cantidad_donada');

      if (entregaProductError) throw entregaProductError;

      const donacionesPorProducto = entregaProductData.reduce((acc, donacion) => {
        if (!acc[donacion.producto_id]) {
          acc[donacion.producto_id] = 0;
        }
        acc[donacion.producto_id] += donacion.cantidad_donada;
        return acc;
      }, {});

      const agrupados = postProductosData.reduce((acc, item) => {
        if (item.productos && item.productos.nombrep && item.productos.descripcion) {
          const categoria = item.productos.descripcion;
          const nombre = item.productos.nombrep;
          const cantidadTotal = item.cantidadp || 0;
          const cantidadDonada = donacionesPorProducto[item.productos_id] || 0;
          const cantidadDisponible = Math.max(cantidadTotal - cantidadDonada, 0);

          if (!acc[categoria]) {
            acc[categoria] = {};
          }
          if (!acc[categoria][nombre]) {
            acc[categoria][nombre] = {
              cantidadTotal: 0,
              cantidadDisponible: 0,
              post_id: item.post_id,
              producto_id: item.productos_id
            };
          }
          acc[categoria][nombre].cantidadTotal += cantidadTotal;
          acc[categoria][nombre].cantidadDisponible += cantidadDisponible;
        }
        return acc;
      }, {});

      setProductosAgrupados(agrupados);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching alimentos:', error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
    fetchAlimentos();
  }, []);

  const handleDonation = async () => {
    if (!selectedProduct || !donationAmount || isNaN(donationAmount) || !selectedInstitutionId) {
      Alert.alert('Error', 'Por favor, seleccione un producto, una institución y una cantidad válida.');
      return;
    }

    const donationQuantity = parseFloat(donationAmount);
    if (donationQuantity <= 0 || donationQuantity > selectedProduct.cantidadDisponible) {
      Alert.alert('Error', 'La cantidad donada no puede exceder la cantidad disponible.');
      return;
    }

    try {
      setIsLoading(true);

      const { data: entregaData, error: entregaError } = await supabase
        .from('entrega_product')
        .insert({
          producto_id: selectedProduct.producto_id,
          cantidad_donada: donationQuantity,
          fundacion: selectedInstitutionId,
          nombre_fundacion: selectedInstitutionName,
        });

      if (entregaError) throw entregaError;

      Alert.alert('Éxito', 'Donación registrada correctamente');
      setSelectedProduct(null);
      setDonationAmount('');
      setSelectedInstitutionId(null);
      setSelectedInstitutionName('');
      await fetchAlimentos();
    } catch (error) {
      console.error('Error processing donation:', error.message);
      Alert.alert('Error', 'Hubo un problema al procesar la donación. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e175" />
      </View>
    );
  }

  const institutionOptions = institutions.map(inst => ({
    label: inst.nombre,
    value: inst.id,
  }));

  const navigateToAddPost = () => {
    navigation.navigate('Detalles');
  };

  return (
    <ScrollView style={styles.container}>
      {Object.entries(productosAgrupados).map(([categoria, productos]) => (
        <View key={categoria} style={styles.categoriaContainer}>
          <Text style={styles.categoriaTitle}>{categoria}</Text>
          {Object.entries(productos).length > 0 ? (
            Object.entries(productos).map(([nombre, { cantidadTotal, cantidadDisponible, post_id, producto_id }]) => (
              <View key={nombre} style={styles.itemContainer}>
                <View>
                  <Text style={styles.itemText}>{nombre}</Text>
                  <Text style={styles.itemSubText}>Total: {cantidadTotal} KG</Text>
                  <Text style={styles.itemSubText}>Disponible: {cantidadDisponible} KG</Text>
                </View>
                <CustomButton
                  title="Donar"
                  onPress={() => setSelectedProduct({ nombre, cantidadDisponible, post_id, producto_id })}
                  disabled={cantidadDisponible <= 0}
                />
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No hay {categoria.toLowerCase()} disponibles</Text>
          )}
        </View>
      ))}

      {selectedProduct && (
        <View style={styles.donationForm}>
          <Text style={styles.donationTitle}>Donar {selectedProduct.nombre}</Text>
          <Text style={styles.donationSubtitle}>Cantidad disponible: {selectedProduct.cantidadDisponible} KG</Text>
          <TextInput
            style={styles.input}
            placeholder="Cantidad a donar (KG)"
            keyboardType="numeric"
            value={donationAmount}
            onChangeText={setDonationAmount}
          />
          <CustomPicker
            selectedValue={selectedInstitutionName}
            onValueChange={(itemValue) => {
              setSelectedInstitutionId(itemValue);
              const selectedInstitution = institutions.find(inst => inst.id === itemValue);
              setSelectedInstitutionName(selectedInstitution ? selectedInstitution.nombre : '');
            }}
            options={institutionOptions}
            placeholder="Seleccione una institución"
          />
          <CustomButton2 title="Confirmar Donación" onPress={handleDonation} />
        </View>
      )}
      
      <TouchableOpacity style={styles.addButton} onPress={navigateToAddPost}>
      <Icon name="format-list-bulleted" size={28} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriaContainer: {
    marginBottom: 20,
  },
  categoriaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
  },
  itemSubText: {
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
  },
  donationForm: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0fbea',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  donationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0f290a',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderColor: '#77d353',
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 15,
    paddingHorizontal: 12,
  },
  donationSubtitle: {
    color: '#254b1c',
  },
  button: {
    width: '30%',
    padding: 15,
    backgroundColor: '#77d353',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  button2: {
    width: '100%',
    padding: 15,
    backgroundColor: '#77d353',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  addButton: {
    position: 'absolute',
    top: -3,
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
});

export default AlimentosList;
