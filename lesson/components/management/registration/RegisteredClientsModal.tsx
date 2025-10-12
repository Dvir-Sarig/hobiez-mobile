import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { Avatar } from 'react-native-paper';
import { fetchClientGlobalInfo, ClientGlobalInfo } from '../../../../profile/services/clientService';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface RegisteredClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  registeredClients: { id: string; name: string }[];
  isLoading: boolean; // external loading of registrations
  onNavigateProfile?: () => void; // new callback
  originScreen?: 'CoachLessons' | 'CoachCalendar';
}

const RegisteredClientsModal: React.FC<RegisteredClientsModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  registeredClients,
  isLoading,
  onNavigateProfile,
  originScreen = 'CoachLessons',
}) => {
  const navigation = useNavigation<any>();
  const [clientInfos, setClientInfos] = useState<{ [key: string]: ClientGlobalInfo | null }>({});
  const [isFetchingInfos, setIsFetchingInfos] = useState(false);

  // Derive ordered data with merged info
  const data = useMemo(() => registeredClients.map(c => ({ ...c, info: clientInfos[c.id] })), [registeredClients, clientInfos]);

  useEffect(() => {
    const loadInfos = async () => {
      if (!isOpen || registeredClients.length === 0) return;
      setIsFetchingInfos(true);
      try {
        const fetches = registeredClients.map(c => fetchClientGlobalInfo(c.id).then(info => ({ id: c.id, info })).catch(() => ({ id: c.id, info: null })));
        const results = await Promise.all(fetches);
        const map: { [k: string]: ClientGlobalInfo | null } = {};
        results.forEach(r => { map[r.id] = r.info; });
        setClientInfos(map);
      } catch (e) {
        console.error('Error fetching client infos', e);
      } finally {
        setIsFetchingInfos(false);
      }
    };
    loadInfos();
  }, [isOpen, registeredClients]);

  const handleClientPress = (clientId: string) => {
    // Close modal first, defer navigation slightly
    onNavigateProfile?.();
    setTimeout(()=>{
      onClose();
      navigation.navigate('ClientProfilePage', { clientId, fromRegisteredClientsModal: true, lessonId, originScreen });
    },10);
  };

  if (!isOpen) return null; // avoid mounting if closed

  const total = registeredClients.length;

  const renderSkeletonItem = (index: number) => (
    <View key={`sk-${index}`} style={styles.listItemSkeleton}> 
      <View style={styles.avatarSkeleton} />
      <View style={{ flex:1 }}> 
        <View style={styles.lineSkeletonShort} />
        <View style={styles.lineSkeletonLong} />
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: typeof data[0] }) => {
    const info = item.info;
    const hasImage = info?.profilePictureUrl && info.profilePictureUrl.trim() !== '';
    return (
      <TouchableOpacity onPress={() => handleClientPress(item.id)} style={styles.listItem} accessibilityLabel={`View ${info?.name || item.name || 'client'} profile`}> 
        {hasImage ? (
          <Avatar.Image source={{ uri: info!.profilePictureUrl! }} size={42} style={styles.avatarImg} />
        ) : (
          <Avatar.Text label={(info?.name || item.name || 'C').charAt(0).toUpperCase()} size={42} style={styles.avatarFallback} />
        )}
        <View style={{ flex:1 }}> 
          <Text style={styles.clientName} numberOfLines={1}>{info?.name || item.name || `Client ${item.id}`}</Text>
          <Text style={styles.clientEmail} numberOfLines={1}>{info?.email || 'Tap to view profile'}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color="#0d47a1" />
      </TouchableOpacity>
    );
  };

  const showEmpty = !isLoading && !isFetchingInfos && total === 0;

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlay}> 
        <View style={styles.shell}> 
          {/* Header */}
          <LinearGradient colors={['#0d47a1','#1976d2']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.headerBar}> 
            <View style={styles.headerLeft}> 
              <View style={styles.headerIconBadge}> 
                <Ionicons name="people-circle" size={26} color="#ffffff" />
              </View>
              <View style={styles.headerTextCol}> 
                <Text style={styles.headerTitle}>Registered Clients</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>Lesson ID: {lessonId}</Text>
              </View>
            </View>
            <View style={styles.headerRight}> 
              <View style={styles.countPill}> 
                <Ionicons name="people-outline" size={14} color="#0d47a1" />
                <Text style={styles.countPillText}>{total}</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close registered clients modal"> 
                <MaterialIcons name="close" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Content */}
          <View style={styles.contentWrap}> 
            <View style={styles.sectionCard}> 
              <Text style={styles.sectionLabel}>Participants</Text>
              {showEmpty && (
                <View style={styles.emptyStateBox}> 
                  <Ionicons name="person-add-outline" size={26} color="#1976d2" style={{ marginBottom:10 }} />
                  <Text style={styles.emptyTitle}>No clients yet</Text>
                  <Text style={styles.emptySubtitle}>Share the lesson to attract participants.</Text>
                </View>
              )}

              {(isLoading || isFetchingInfos) && !showEmpty && (
                <View style={{ marginTop:4 }}> 
                  {Array.from({ length: Math.min(5, Math.max(3, total || 5)) }).map((_, i) => renderSkeletonItem(i))}
                </View>
              )}

              {!isLoading && !isFetchingInfos && !showEmpty && (
                <FlatList
                  data={data}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderItem}
                  scrollEnabled={data.length > 6}
                  style={{ maxHeight: 340 }}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              )}
            </View>
            <View style={{ height: 110 }} />
          </View>

          {/* Footer */}
          <View style={styles.footerBar}> 
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose} accessibilityLabel="Close modal"> 
              <Text style={styles.closeFooterBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', padding:20 },
  shell:{ backgroundColor:'rgba(255,255,255,0.96)', borderRadius:30, overflow:'hidden', maxHeight:'92%', ...Platform.select({ ios:{ shadowColor:'#000', shadowOpacity:0.25, shadowRadius:18, shadowOffset:{width:0,height:8}}, android:{ elevation:10 } }) },
  headerBar:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:18, paddingVertical:16 },
  headerLeft:{ flexDirection:'row', alignItems:'center', flex:1, gap:12 },
  headerRight:{ flexDirection:'row', alignItems:'center', gap:12 },
  headerIconBadge:{ width:46, height:46, borderRadius:16, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)' },
  headerTextCol:{ flex:1 },
  headerTitle:{ fontSize:19, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  headerSubtitle:{ fontSize:12, fontWeight:'600', color:'rgba(255,255,255,0.85)', marginTop:2 },
  closeBtn:{ width:40, height:40, borderRadius:14, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)' },
  countPill:{ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#ffffff', paddingHorizontal:12, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:'rgba(13,71,161,0.25)', shadowColor:'#0d47a1', shadowOpacity:0.1, shadowRadius:6, shadowOffset:{width:0,height:3} },
  countPillText:{ fontSize:13, fontWeight:'800', color:'#0d47a1', letterSpacing:0.4 },
  contentWrap:{ padding:20, paddingBottom:0 },
  sectionCard:{ backgroundColor:'#ffffff', borderRadius:24, padding:18, borderWidth:1, borderColor:'rgba(13,71,161,0.08)', shadowColor:'#0d47a1', shadowOpacity:0.05, shadowRadius:10, shadowOffset:{width:0,height:4} },
  sectionLabel:{ fontSize:12, fontWeight:'800', color:'#0d47a1', marginBottom:14, letterSpacing:0.6, textTransform:'uppercase' },
  emptyStateBox:{ alignItems:'center', paddingVertical:26, paddingHorizontal:10 },
  emptyTitle:{ fontSize:15, fontWeight:'800', color:'#0d47a1', marginBottom:4 },
  emptySubtitle:{ fontSize:12.5, fontWeight:'600', color:'#475569', textAlign:'center', lineHeight:18 },
  listItem:{ flexDirection:'row', alignItems:'center', paddingVertical:10 },
  separator:{ height:1, backgroundColor:'rgba(13,71,161,0.08)' },
  avatarImg:{ marginRight:14, backgroundColor:'rgba(13,71,161,0.10)' },
  avatarFallback:{ marginRight:14, backgroundColor:'#1976d2' },
  clientName:{ fontSize:15, fontWeight:'700', color:'#0d47a1' },
  clientEmail:{ fontSize:12.5, fontWeight:'600', color:'#475569', marginTop:2 },
  // Skeletons
  listItemSkeleton:{ flexDirection:'row', alignItems:'center', paddingVertical:10 },
  avatarSkeleton:{ width:42, height:42, borderRadius:14, backgroundColor:'rgba(13,71,161,0.10)', marginRight:14 },
  lineSkeletonShort:{ width:'40%', height:12, borderRadius:6, backgroundColor:'rgba(13,71,161,0.10)', marginBottom:6 },
  lineSkeletonLong:{ width:'65%', height:11, borderRadius:6, backgroundColor:'rgba(13,71,161,0.08)' },
  footerBar:{ flexDirection:'row', alignItems:'center', justifyContent:'center', padding:18, borderTopWidth:1, borderTopColor:'rgba(13,71,161,0.12)', backgroundColor:'rgba(255,255,255,0.94)' },
  closeFooterBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, borderWidth:1.5, borderColor:'rgba(25,118,210,0.25)' },
  closeFooterBtnText:{ color:'#0d47a1', fontSize:14, fontWeight:'700', letterSpacing:0.4 },
});

export default RegisteredClientsModal;

