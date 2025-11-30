import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function AboutDashboard() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  // Safety render helper to ensure any accidental raw string content
  // is always wrapped in a <Text> to avoid "Text strings must be rendered within a <Text> component" errors.
  const renderSectionContent = (content: React.ReactNode) => {
    if (typeof content === 'string') {
      return <Text style={styles.bodyText}>{content}</Text>;
    }
    return content;
  };

  const sections = [
    {
      title: 'What is Hobinet?',
      icon: 'emoji-objects',
      content: (
        <Text style={styles.bodyText}> <Text style={{ fontWeight:'800' }}>Hobinet</Text> connects people through hobbies & structured lessons — helping clients explore and coaches grow.</Text>
      )
    },
    {
      title: 'What you can do today',
      icon: 'check-circle-outline',
      content: (
        <View style={styles.bulletBlock}> 
          <View style={styles.bulletRow}> <MaterialIcons name='chevron-right' size={16} color='#0d47a1' /> <Text style={styles.bulletText}>Discover coaches & register for lessons fast.</Text></View>
          <View style={styles.bulletRow}> <MaterialIcons name='chevron-right' size={16} color='#0d47a1' /> <Text style={styles.bulletText}>Create, edit & manage coaching sessions (coaches).</Text></View>
          <View style={styles.bulletRow}> <MaterialIcons name='chevron-right' size={16} color='#0d47a1' /> <Text style={styles.bulletText}>View schedules & upcoming registrations.</Text></View>
          <View style={styles.bulletRow}> <MaterialIcons name='chevron-right' size={16} color='#0d47a1' /> <Text style={styles.bulletText}>Track participation & attendee counts.</Text></View>
        </View>
      )
    },
    {
      title: 'Coming Soon',
      icon: 'rocket-launch',
      content: (
        <View style={styles.bulletBlock}> 
          <View style={styles.bulletRow}> <MaterialIcons name='circle' size={10} color='#1976d2' /> <Text style={styles.bulletText}>Social networking & following.</Text></View>
          <View style={styles.bulletRow}> <MaterialIcons name='circle' size={10} color='#1976d2' /> <Text style={styles.bulletText}>Community feed & sharing.</Text></View>
          <View style={styles.bulletRow}> <MaterialIcons name='circle' size={10} color='#1976d2' /> <Text style={styles.bulletText}>Public reviews & recommendations.</Text></View>
          <View style={styles.bulletRow}> <MaterialIcons name='circle' size={10} color='#1976d2' /> <Text style={styles.bulletText}>Announcements & promotional posts.</Text></View>
          <View style={styles.bulletRow}> <MaterialIcons name='circle' size={10} color='#1976d2' /> <Text style={styles.bulletText}>Analytics for personal & coaching growth.</Text></View>
        </View>
      )
    },
    {
      title: 'Contact Us',
      icon: 'support-agent',
      content: (
        <View> 
          <Text style={[styles.bodyText,{ marginBottom:14 }]}>Have feedback or found a bug? Reach out anytime.</Text>
          <Text style={styles.linkText} onPress={() => Linking.openURL('mailto:dvirsarig1@gmail.com')}>📧 dvirsarig1@gmail.com</Text>
          <Text style={styles.linkText} onPress={() => Linking.openURL('tel:+972526660845')}>📞 +972526660845</Text>
        </View>
      )
    }
  ];

  return (
    <LinearGradient colors={['#0d47a1','#1565c0','#1e88e5']} style={styles.gradientBg}>
      <View pointerEvents='none' style={styles.decorBubbleOne} />
      <View pointerEvents='none' style={styles.decorBubbleTwo} />
      <View pointerEvents='none' style={styles.decorBubbleThree} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}> 
          <View style={styles.heroIconBadge}><MaterialIcons name='info-outline' size={22} color='#ffffff' /></View>
          <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>About Hobinet</Text>
          <Text style={styles.heroSubtitle}>A growing platform for hobby learning, coaching & community.</Text>
        </View>
        {sections.map((s,i)=> (
          <View key={i} style={styles.sectionCard}> 
            <View style={styles.sectionHeaderRow}> 
              <MaterialIcons name={s.icon as any} size={20} color='#ffffff' />
              <Text style={styles.sectionTitle}>{s.title}</Text>
            </View>
            {renderSectionContent(s.content)}
          </View>
        ))}
        <Text style={styles.footerNote}>Thank you for being an early adopter.</Text>
        <View style={{height:50}} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg:{ flex:1 },
  scrollContent:{ paddingTop:Platform.OS==='ios'? 56:40, paddingBottom:60 },
  heroWrap:{ paddingHorizontal:22, marginBottom:8 },
  heroIconBadge:{ width:52, height:52, borderRadius:18, backgroundColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.35)', marginBottom:14 },
  heroTitle:{ fontSize:32, fontWeight:'800', color:'#ffffff', letterSpacing:0.5, marginBottom:10 },
  heroTitleMobile:{ fontSize:26 },
  heroSubtitle:{ fontSize:14, fontWeight:'600', color:'rgba(255,255,255,0.82)', lineHeight:20, marginBottom:14 },
  sectionCard:{ marginTop:30, marginHorizontal:18, backgroundColor:'rgba(255,255,255,0.16)', borderRadius:26, padding:22, borderWidth:1, borderColor:'rgba(255,255,255,0.30)', shadowColor:'#000', shadowOpacity:0.20, shadowRadius:14, shadowOffset:{width:0,height:6} },
  sectionHeaderRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:12 },
  sectionTitle:{ fontSize:17, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  bodyText:{ fontSize:13.5, fontWeight:'600', color:'rgba(255,255,255,0.90)', lineHeight:20 },
  bulletBlock:{ gap:10 },
  bulletRow:{ flexDirection:'row', alignItems:'flex-start', gap:8 },
  bulletText:{ flex:1, fontSize:13.5, fontWeight:'600', color:'rgba(255,255,255,0.92)', lineHeight:20 },
  linkText:{ fontSize:14, fontWeight:'700', color:'#ffffff', marginBottom:8 },
  footerNote:{ marginTop:36, textAlign:'center', fontSize:12, fontWeight:'700', color:'rgba(255,255,255,0.75)', letterSpacing:0.4 },
  decorBubbleOne:{ position:'absolute', top:-70, left:-50, width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.07)' },
  decorBubbleTwo:{ position:'absolute', top:260, right:-60, width:240, height:240, borderRadius:120, backgroundColor:'rgba(255,255,255,0.05)' },
  decorBubbleThree:{ position:'absolute', bottom:-90, left:-40, width:180, height:180, borderRadius:90, backgroundColor:'rgba(255,255,255,0.06)' },
});
