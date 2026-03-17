import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
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
  onLocationClear?: () => void;
  radiusKm?: number | null;
  onRadiusChange?: (radius: number | null) => void;
}

const RADIUS_OPTIONS = [1, 3, 5, 10, 15, 20, 30];

const SearchLocationField: React.FC<SearchLocationFieldProps> = ({
  location,
  onLocationSelect,
  onLocationClear,
  radiusKm = null,
  onRadiusChange,
}) => {
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [portalVisible, setPortalVisible] = useState(false);
  const inputContainerRef = useRef<View | null>(null);
  const [anchorLayout, setAnchorLayout] = useState<{x:number;y:number;width:number;height:number}|null>(null);

  const hasLocation = !!location?.city && !!location?.latitude;

  useEffect(() => {
    const searchPlaces = async () => {
      if (searchText.length < 2) { setPredictions([]); return; }
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchText)}&types=(cities)&key=${GOOGLE_MAPS_API_KEY}`
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
    } finally { setIsLoading(false); }
  };

  const openPortal = () => setPortalVisible(true);
  const closePortal = () => { setPortalVisible(false); setPredictions([]); };

  /* ── When location is set: show badge ── */
  if (hasLocation) {
    return (
      <View style={styles.selectedContainer}>
        <View style={styles.locationBadge}>
          <MaterialIcons name="location-on" size={16} color="#1565c0" />
          <Text style={styles.locationBadgeText} numberOfLines={1}>{location!.city}</Text>
          {onLocationClear && (
            <Pressable onPress={onLocationClear} hitSlop={8} style={styles.badgeClearBtn}>
              <MaterialIcons name="close" size={14} color="#546e7a" />
            </Pressable>
          )}
        </View>
        {onRadiusChange && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radiusRow}>
            {RADIUS_OPTIONS.map((r) => (
              <Pressable
                key={r}
                style={[styles.radiusChip, radiusKm === r && styles.radiusChipActive]}
                onPress={() => onRadiusChange(radiusKm === r ? null : r)}
              >
                <Text style={[styles.radiusChipText, radiusKm === r && styles.radiusChipTextActive]}>{r} ק״מ</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  /* ── When no location: show search input ── */
  return (
    <View
      style={styles.container}
      ref={(ref) => { inputContainerRef.current = ref; }}
      onLayout={() => {
        if (inputContainerRef.current) {
          inputContainerRef.current.measureInWindow((x, y, width, height) => {
            setAnchorLayout({ x, y, width, height });
          });
        }
      }}
    >
      <View style={styles.searchRow}>
        <MaterialIcons name="location-on" size={18} color="#90a4ae" />
        <TextInput
          style={styles.input}
          placeholder="חפש מיקום..."
          placeholderTextColor="#90a4ae"
          value={searchText}
          onChangeText={(t) => {
            setSearchText(t);
            if (t.length >= 2 && !portalVisible) openPortal();
            if (t.length < 2 && portalVisible) setPredictions([]);
          }}
          onFocus={() => { if (searchText.length >= 2) openPortal(); }}
        />
        {isLoading && <ActivityIndicator color="#1565c0" size="small" />}
      </View>

      {/* Predictions dropdown */}
      <Modal visible={portalVisible && predictions.length > 0} transparent animationType="fade" onRequestClose={closePortal}>
        <Pressable style={styles.portalOverlay} onPress={closePortal}>
          {anchorLayout && (
            <View style={[styles.portalDropdown, { top: anchorLayout.y + anchorLayout.height + 4, left: anchorLayout.x, width: anchorLayout.width }]}>
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={{ maxHeight: 240 }}>
                {predictions.map((item) => (
                  <TouchableOpacity key={item.place_id} style={styles.predictionItem} onPress={() => { handlePlaceSelect(item.place_id); closePortal(); }}>
                    <MaterialIcons name="place" size={16} color="#90a4ae" />
                    <Text style={styles.predictionText} numberOfLines={1}>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  /* ── No-location state ── */
  container: { width: '100%', position: 'relative', zIndex: 60 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 14, height: 46, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 },
  },
  input: { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '500', paddingVertical: 0 },

  /* ── Portal dropdown ── */
  portalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  portalDropdown: {
    position: 'absolute', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e0e6ee',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 50, paddingVertical: 4, overflow: 'hidden',
  },
  predictionItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  predictionText: { flex: 1, fontSize: 13.5, color: '#0f172a', fontWeight: '600', writingDirection: 'rtl' },

  /* ── Selected-location badge state ── */
  selectedContainer: { gap: 8 },
  locationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#90caf9',
  },
  locationBadgeText: { fontSize: 13, fontWeight: '700', color: '#0d47a1', writingDirection: 'rtl', maxWidth: 200 },
  badgeClearBtn: { marginStart: 2 },

  /* ── Radius chips ── */
  radiusRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 2 },
  radiusChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#dfe4ea',
  },
  radiusChipActive: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  radiusChipText: { fontSize: 12, fontWeight: '700', color: '#546e7a' },
  radiusChipTextActive: { color: '#fff' },
});

export default SearchLocationField;
