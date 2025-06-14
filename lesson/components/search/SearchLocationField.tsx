import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '../../../shared/config';
import { MaterialIcons } from '@expo/vector-icons';

interface Location {
  city: string;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface SearchLocationFieldProps {
  location: Location | null;
  onLocationSelect: (location: Location) => void;
  radiusKm?: number | null;
  onRadiusChange?: (radius: number | null) => void;
}

const RADIUS_OPTIONS = [1, 5, 10, 15, 20, 30];

const SearchLocationField: React.FC<SearchLocationFieldProps> = ({
  location,
  onLocationSelect,
  radiusKm = null,
  onRadiusChange,
}) => {
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchPlaces = async () => {
      if (searchText.length < 2) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            searchText
          )}&types=(cities)&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        setPredictions(data.predictions || []);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlaces, 300);
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handlePlaceSelect = async (placeId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      const details = data.result;

      if (details) {
        const getComponent = (type: string) =>
          details.address_components.find((c: any) => c.types?.includes(type))?.long_name;

        onLocationSelect({
          city: getComponent('locality') || getComponent('administrative_area_level_1') || '',
          country: getComponent('country') || '',
          address: details.formatted_address,
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        });
        setSearchText('');
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search for location"
          value={searchText}
          onChangeText={setSearchText}
        />
        {isLoading && <ActivityIndicator style={styles.loader} />}
      </View>

      {predictions.length > 0 && (
        <View style={styles.predictionsList}>
          {predictions.map((item) => (
            <TouchableOpacity
              key={item.place_id}
              style={styles.predictionItem}
              onPress={() => handlePlaceSelect(item.place_id)}
            >
              <Text style={styles.predictionText}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {location?.city ? (
        <View style={styles.locationBadge}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="location-on" size={18} color="#0d47a1" />
            <Text style={styles.locationText}>
              {location.city}, {location.country}
              {radiusKm ? ` • ${radiusKm} km` : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() =>
            onLocationSelect({ city: '', country: '', address: null, latitude: null, longitude: null })
          }>
            <MaterialIcons name="close" size={18} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      ) : null}

      {location?.city && onRadiusChange && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.radiusSelector}
        >
          {RADIUS_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.radiusOption,
                radiusKm === r && styles.radiusOptionSelected,
              ]}
              onPress={() => onRadiusChange(r)}
            >
              <Text style={{ color: radiusKm === r ? 'white' : '#333' }}>{r} km</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loader: {
    marginLeft: 10,
  },
  predictionsList: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    maxHeight: 200,
    zIndex: 1000,
  },
  predictionItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  predictionText: {
    fontSize: 14,
  },
  locationBadge: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 6,
    color: '#0d47a1',
    fontWeight: '500',
  },
  radiusSelector: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  radiusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
  radiusOptionSelected: {
    backgroundColor: '#1976d2',
  },
});

export default SearchLocationField;
