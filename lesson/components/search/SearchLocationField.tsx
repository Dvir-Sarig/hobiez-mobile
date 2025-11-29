import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Modal, Pressable } from 'react-native';
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
  const [portalVisible, setPortalVisible] = useState(false);
  const [radiusPickerVisible, setRadiusPickerVisible] = useState(false);
  const inputContainerRef = useRef<View | null>(null);
  const [anchorLayout, setAnchorLayout] = useState<{x:number;y:number;width:number;height:number}|null>(null);

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

  const openPortal = () => setPortalVisible(true);
  const closePortal = () => { setPortalVisible(false); setPredictions([]); };

  return (
  <View style={styles.container} ref={ref=> { inputContainerRef.current = ref; }}
      onLayout={() => {
        if (inputContainerRef.current) {
          inputContainerRef.current.measureInWindow((x,y,width,height)=>{
            setAnchorLayout({x,y,width,height});
          });
        }
      }}
    >
      <View style={styles.searchContainer}>
        <MaterialIcons name="location-on" size={18} color="#1565c0" style={styles.inlineIcon} />
        <TextInput
          style={styles.input}
          placeholder="Location"
          placeholderTextColor="#78909c"
          value={searchText}
          onChangeText={(t)=>{ setSearchText(t); if (t.length>=2 && !portalVisible) openPortal(); if (t.length<2 && portalVisible) setPredictions([]); }}
          onFocus={()=> { if (searchText.length>=2) openPortal(); }}
        />
        {location?.city && onRadiusChange && (
          <TouchableOpacity style={styles.radiusButton} onPress={()=> setRadiusPickerVisible(true)}>
            <MaterialIcons name="my-location" size={14} color="#1565c0" />
            <Text style={styles.radiusButtonText}>{radiusKm != null ? `${radiusKm} km` : 'Radius'}</Text>
            <MaterialIcons name="expand-more" size={16} color="#1565c0" />
          </TouchableOpacity>
        )}
        {isLoading && <ActivityIndicator style={styles.loader} color="#1565c0" />}
      </View>
      {/* Radius Scroll Picker Modal */}
      <Modal visible={radiusPickerVisible} transparent animationType="fade" onRequestClose={()=> setRadiusPickerVisible(false)}>
        <Pressable style={styles.radiusPickerOverlay} onPress={()=> setRadiusPickerVisible(false)}>
          <View style={styles.radiusPickerContainer}>
            <Text style={styles.radiusPickerTitle}>Select Radius (km)</Text>
            <ScrollView style={{maxHeight:260}} showsVerticalScrollIndicator={false}>
              {[...Array(31).keys()].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.radiusPickerItem, radiusKm===v && styles.radiusPickerItemActive]}
                  onPress={()=> { onRadiusChange?.(v===radiusKm? null : v); setRadiusPickerVisible(false); }}
                >
                  <Text style={[styles.radiusPickerItemText, radiusKm===v && styles.radiusPickerItemTextActive]}>{v} km</Text>
                  {radiusKm===v && <MaterialIcons name="check" size={18} color="#ffffff" style={{marginLeft:'auto'}} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {radiusKm!=null && (
              <TouchableOpacity style={styles.clearRadiusBtn} onPress={()=> { onRadiusChange?.(null); setRadiusPickerVisible(false); }}>
                <MaterialIcons name="close" size={16} color="#1565c0" />
                <Text style={styles.clearRadiusText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
      <Modal visible={portalVisible && predictions.length>0} transparent animationType="fade" onRequestClose={closePortal}>
        <Pressable style={styles.portalOverlay} onPress={closePortal}>
          {anchorLayout && (
            <View style={[styles.portalDropdown,{ top: anchorLayout.y + anchorLayout.height + 4, left: anchorLayout.x, width: anchorLayout.width }]}> 
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={{maxHeight:260}}>
                {predictions.map(item => (
                  <TouchableOpacity key={item.place_id} style={styles.predictionItem} onPress={()=> { handlePlaceSelect(item.place_id); closePortal(); }}>
                    <Text style={styles.predictionText}>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Pressable>
      </Modal>

      {/* Location badge with internal clear removed: clearing handled by parent SearchForm chips */}

      {/* Removed below-the-field radius chips; now inline */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginTop: 8, position: 'relative', zIndex: 60 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor:'#ffffff', borderRadius:14, borderWidth:1, borderColor:'#d5dde5', paddingHorizontal:12, height:46, position:'relative', flex:1, width:'100%' },
  inlineIcon:{ marginRight:6 },
  input: { flex:1, fontSize:14, color:'#0f172a', fontWeight:'500', paddingVertical:0 },
  loader: { marginLeft: 8 },
  predictionsList: { display:'none' },
  portalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.08)' },
  portalDropdown:{ position:'absolute', backgroundColor:'#ffffff', borderRadius:16, borderWidth:1, borderColor:'#d5dde5', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:16, shadowOffset:{width:0,height:8}, elevation:50, paddingVertical:4, overflow:'hidden' },
  predictionItem: { padding: 12, borderBottomWidth:1, borderBottomColor:'#e6edf2' },
  predictionText: { fontSize:13.5, color:'#0f172a', fontWeight:'600' },
  locationBadge: { marginTop:8, paddingVertical:8, paddingHorizontal:12, backgroundColor:'#e3f2fd', borderRadius:14, flexDirection:'row', alignItems:'center', gap:8, borderWidth:1, borderColor:'#bbdefb', alignSelf:'flex-start' },
  locationText: { fontSize:12.5, color:'#0d47a1', fontWeight:'700' },
  clearLocBtn:{ width:24, height:24, borderRadius:12, backgroundColor:'#ffffff', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#d5dde5' },
  radiusWrapper:{ marginTop:6 },
  radiusLabel:{ fontSize:11, fontWeight:'700', color:'#607d8b', marginBottom:4, marginLeft:2, textTransform:'uppercase', letterSpacing:0.5 },
  radiusSelector: { flexDirection:'row', gap:8, paddingHorizontal:2 },
  radiusChip:{ flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:12, paddingVertical:6, backgroundColor:'#ffffff', borderRadius:20, borderWidth:1, borderColor:'#d5dde5' },
  radiusChipActive:{ backgroundColor:'#1565c0', borderColor:'#1565c0' },
  radiusChipText:{ fontSize:12.5, fontWeight:'600', color:'#1565c0' },
  radiusChipTextActive:{ color:'#ffffff' },
  inlineRadiusRow:{ display:'none' },
  radiusButton:{ flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'#ffffff', borderRadius:12, borderWidth:1, borderColor:'#d5dde5', paddingHorizontal:8, paddingVertical:6, marginLeft:6 },
  radiusButtonText:{ fontSize:11.5, fontWeight:'700', color:'#1565c0' },
  radiusPickerOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.25)', justifyContent:'center', alignItems:'center', padding:24 },
  radiusPickerContainer:{ backgroundColor:'#ffffff', width:'80%', maxWidth:360, borderRadius:24, padding:18, borderWidth:1, borderColor:'#e2e8f0', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:16, shadowOffset:{width:0,height:8} },
  radiusPickerTitle:{ fontSize:16, fontWeight:'800', color:'#0d47a1', marginBottom:10, letterSpacing:0.5 },
  radiusPickerItem:{ paddingVertical:10, paddingHorizontal:12, borderRadius:14, marginBottom:6, backgroundColor:'#f1f5f9', flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#d5dde5' },
  radiusPickerItemActive:{ backgroundColor:'#1565c0', borderColor:'#1565c0' },
  radiusPickerItemText:{ fontSize:14, fontWeight:'600', color:'#0f172a' },
  radiusPickerItemTextActive:{ color:'#ffffff' },
  clearRadiusBtn:{ marginTop:8, alignSelf:'flex-start', flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'#e3f2fd', paddingHorizontal:10, paddingVertical:8, borderRadius:14, borderWidth:1, borderColor:'#bbdefb' },
  clearRadiusText:{ fontSize:12, fontWeight:'700', color:'#1565c0' },
});

export default SearchLocationField;
