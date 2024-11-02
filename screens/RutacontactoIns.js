// RutacontactoIns.js
import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import geojsondata from '../assets/data/map.json';

export default function RutacontactoIns() {
  const [markers, setMarkers] = React.useState([]);

  React.useEffect(() => {
    const loadMarkers = () => {
      const features = geojsondata.features || [];
      const loadedMarkers = features.map(feature => ({
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        title: feature.properties.title || 'Sin título',
        description: feature.properties.description || 'Sin descripción',
      }));

      // Solo conservar el primer y último marcador
      if (loadedMarkers.length > 0) {
        const firstMarker = loadedMarkers[0];
        const lastMarker = loadedMarkers[loadedMarkers.length - 1];
        setMarkers([firstMarker, lastMarker]);
      }
    };

    loadMarkers();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -33.483500,
          longitude: -70.684200,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
