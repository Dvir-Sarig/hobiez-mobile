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
  Alert,
} from 'react-native';
import { Avatar } from 'react-native-paper';
import { fetchClientGlobalInfo, ClientGlobalInfo } from '../../../../profile/services/clientService';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { RegistrationWithPayment } from '../../../types/Registration';
import PaymentStatusBadge from '../../payment/PaymentStatusBadge';

interface RegisteredClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  registeredClients: { id: string; name: string }[];
  isLoading: boolean; // external loading of registrations
  onNavigateProfile?: () => void; // new callback
  originScreen?: 'CoachLessons' | 'CoachCalendar';
  registrations?: RegistrationWithPayment[];
  onConfirmPayment?: (registrationId: number) => Promise<void>;
  onRejectPayment?: (registrationId: number) => Promise<void>;
  onUnregisterClient?: (clientId: string, clientName: string) => Promise<void>;
}

const RegisteredClientsModal: React.FC<RegisteredClientsModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  registeredClients,
  isLoading,
  onNavigateProfile,
  originScreen = 'CoachLessons',
  registrations = [],
  onConfirmPayment,
  onRejectPayment,
  onUnregisterClient,
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

  // Build a lookup from clientId to registration
  const registrationByClient = useMemo(() => {
    const map: Record<string, RegistrationWithPayment> = {};
    registrations.forEach(r => { if (r.registrationStatus === 'ACTIVE') map[r.clientId] = r; });
    return map;
  }, [registrations]);

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);

  const handleRemoveClient = (clientId: string, clientName: string) => {
    if (!onUnregisterClient) return;
    Alert.alert(
      'Remove Client',
      `Are you sure you want to remove ${clientName} from this lesson? This will unregister them and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoveLoading(clientId);
            try {
              await onUnregisterClient(clientId, clientName);
            } finally {
              setRemoveLoading(null);
            }
          },
        },
      ]
    );
  };

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

  const handleConfirm = async (regId: number) => {
    if (!onConfirmPayment) return;
    setActionLoading(regId);
    try { await onConfirmPayment(regId); } finally { setActionLoading(null); }
  };

  const handleReject = async (regId: number) => {
    if (!onRejectPayment) return;
    setActionLoading(regId);
    try { await onRejectPayment(regId); } finally { setActionLoading(null); }
  };

  const renderItem = ({ item }: { item: typeof data[0] }) => {
    const info = item.info;
    const hasImage = info?.profilePictureUrl && info.profilePictureUrl.trim() !== '';
    const reg = registrationByClient[item.id];
    const isProcessing = reg ? actionLoading === reg.id : false;
    const isRemoving = removeLoading === item.id;
    const displayName = info?.name || item.name || `Client ${item.id}`;
    return (
      <TouchableOpacity onPress={() => handleClientPress(item.id)} style={styles.clientCard} activeOpacity={0.7} accessibilityLabel={`View ${displayName} profile`}>
        {/* Top row: avatar + name + remove + chevron */}
        <View style={styles.clientRow}>
          {hasImage ? (
            <Avatar.Image source={{ uri: info!.profilePictureUrl! }} size={38} style={styles.avatarImg} />
          ) : (
            <Avatar.Text label={(info?.name || item.name || 'C').charAt(0).toUpperCase()} size={38} style={styles.avatarFallback} />
          )}
          <View style={styles.clientInfo}>
            <Text style={styles.clientName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.clientEmail} numberOfLines={1}>{info?.email || 'Tap to view profile'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
        </View>

        {/* Payment strip — compact inline row */}
        {reg && (
          <View style={styles.paymentStrip}>
            <View style={styles.paymentTopRow}>
              <PaymentStatusBadge status={reg.paymentStatus} compact method={reg.paymentMethod} />
              {reg.paymentStatus === 'PENDING' && onConfirmPayment && onRejectPayment && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.confirmBtn, isProcessing && styles.actionBtnDisabled]}
                    onPress={(e) => { e.stopPropagation?.(); handleConfirm(reg.id); }}
                    disabled={isProcessing}
                    activeOpacity={0.7}
                    accessibilityLabel="Confirm payment"
                  >
                    {isProcessing ? <ActivityIndicator size={12} color="#fff" /> : <MaterialIcons name="check" size={14} color="#ffffff" />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn, isProcessing && styles.actionBtnDisabled]}
                    onPress={(e) => { e.stopPropagation?.(); handleReject(reg.id); }}
                    disabled={isProcessing}
                    activeOpacity={0.7}
                    accessibilityLabel="Reject payment"
                  >
                    <MaterialIcons name="close" size={14} color="#1976d2" />
                  </TouchableOpacity>
                </View>
              )}
              {onUnregisterClient && (
                <TouchableOpacity
                  style={[styles.unregisterBtn, isRemoving && styles.unregisterBtnDisabled]}
                  onPress={(e) => { e.stopPropagation?.(); handleRemoveClient(item.id, displayName); }}
                  disabled={isRemoving}
                  activeOpacity={0.7}
                  accessibilityLabel={`Unregister ${displayName} from lesson`}
                >
                  {isRemoving ? (
                    <ActivityIndicator size={12} color="#ffffff" />
                  ) : (
                    <Text style={styles.unregisterBtnText}>Unregister</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {reg.paymentNote ? (
              <Text style={styles.paymentNote} numberOfLines={1}>"{reg.paymentNote}"</Text>
            ) : null}
          </View>
        )}
        
        {/* Unregister button fallback for clients without payment info */}
        {!reg && onUnregisterClient && (
          <View style={styles.unregisterFallbackRow}>
            <TouchableOpacity
              style={[styles.unregisterBtn, isRemoving && styles.unregisterBtnDisabled]}
              onPress={(e) => { e.stopPropagation?.(); handleRemoveClient(item.id, displayName); }}
              disabled={isRemoving}
              activeOpacity={0.7}
              accessibilityLabel={`Unregister ${displayName} from lesson`}
            >
              {isRemoving ? (
                <ActivityIndicator size={12} color="#ffffff" />
              ) : (
                <Text style={styles.unregisterBtnText}>Unregister</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  contentWrap:{ paddingHorizontal:20, paddingTop:16, paddingBottom:0 },
  emptyStateBox:{ alignItems:'center', paddingVertical:26, paddingHorizontal:10 },
  emptyTitle:{ fontSize:15, fontWeight:'800', color:'#0d47a1', marginBottom:4 },
  emptySubtitle:{ fontSize:12.5, fontWeight:'600', color:'#475569', textAlign:'center', lineHeight:18 },
  clientCard:{ padding:14, marginVertical:6, borderBottomWidth:1, borderBottomColor:'rgba(13,71,161,0.08)' },
  clientRow:{ flexDirection:'row', alignItems:'center' },
  clientInfo:{ flex:1, marginLeft:10 },
  separator:{ height:0 },
  avatarImg:{ backgroundColor:'rgba(13,71,161,0.10)' },
  avatarFallback:{ backgroundColor:'#1976d2' },
  clientName:{ fontSize:14, fontWeight:'700', color:'#0f172a' },
  clientEmail:{ fontSize:11.5, fontWeight:'500', color:'#64748b', marginTop:1 },
  paymentStrip:{ marginTop:8, paddingTop:8, borderTopWidth:1, borderTopColor:'rgba(13,71,161,0.06)', gap:6 },
  paymentTopRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap:8 },
  paymentNote:{ fontSize:11, fontWeight:'500', color:'#94a3b8', fontStyle:'italic' },
  actionRow:{ flexDirection:'row', gap:6 },
  actionBtn:{ width:30, height:30, borderRadius:15, alignItems:'center', justifyContent:'center' },
  actionBtnDisabled:{ opacity:0.45 },
  confirmBtn:{ backgroundColor:'#1976d2' },
  rejectBtn:{ backgroundColor:'rgba(25,118,210,0.08)', borderWidth:1, borderColor:'rgba(25,118,210,0.28)' },
  // Skeletons
  listItemSkeleton:{ flexDirection:'row', alignItems:'center', paddingVertical:10 },
  avatarSkeleton:{ width:38, height:38, borderRadius:14, backgroundColor:'rgba(13,71,161,0.10)', marginRight:12 },
  lineSkeletonShort:{ width:'40%', height:12, borderRadius:6, backgroundColor:'rgba(13,71,161,0.10)', marginBottom:6 },
  lineSkeletonLong:{ width:'65%', height:11, borderRadius:6, backgroundColor:'rgba(13,71,161,0.08)' },
  footerBar:{ flexDirection:'row', alignItems:'center', justifyContent:'center', padding:18, borderTopWidth:1, borderTopColor:'rgba(13,71,161,0.12)', backgroundColor:'rgba(255,255,255,0.94)' },
  closeFooterBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, borderWidth:1.5, borderColor:'rgba(25,118,210,0.25)' },
  closeFooterBtnText:{ color:'#0d47a1', fontSize:14, fontWeight:'700', letterSpacing:0.4 },
  removeBtn:{ width:38, height:38, borderRadius:14, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(239,68,68,0.10)', marginRight:8 },
  removeBtnDisabled:{ opacity:0.45 },
  unregisterBtn:{ paddingHorizontal:14, paddingVertical:8, borderRadius:12, backgroundColor:'#1976d2', marginLeft:'auto' },
  unregisterBtnDisabled:{ opacity:0.6 },
  unregisterBtnText:{ color:'#ffffff', fontSize:12, fontWeight:'700', letterSpacing:0.5 },
  unregisterFallbackRow:{ paddingTop:8, marginTop:8, borderTopWidth:1, borderTopColor:'rgba(13,71,161,0.06)', flexDirection:'row', justifyContent:'flex-end' },
});

export default RegisteredClientsModal;

