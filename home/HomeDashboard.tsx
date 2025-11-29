import React, { useMemo } from 'react';
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    Platform,
    TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeDashboard() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h < 5) return 'Late Night Session';
        if (h < 12) return 'Good Morning';
        if (h < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    return (
        <LinearGradient colors={['#0d47a1','#1565c0','#1e88e5']} style={styles.gradientBg}>
            {/* Decorative bubbles */}
            <View pointerEvents="none" style={styles.decorBubbleOne} />
            <View pointerEvents="none" style={styles.decorBubbleTwo} />
            <View pointerEvents="none" style={styles.decorBubbleThree} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero / Welcome */}
                <View style={styles.heroWrapper}> 
                    {/* Removed hero badge row (tennis icon + version tag) per request */}
                    <Text style={[styles.title, isMobile && styles.titleMobile]}>{greeting} 👋</Text>
                    <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>Welcome to Hobinet — your hub for learning, coaching and progress.</Text>
                    <View style={styles.heroMetricRow}> 
                        <View style={styles.metricCard}> 
                            <Text style={styles.metricValue}>⚡</Text>
                            <Text style={styles.metricLabel}>Fast Booking</Text>
                        </View>
                        <View style={styles.metricCard}> 
                            <Text style={styles.metricValue}>🧠</Text>
                            <Text style={styles.metricLabel}>Skill Growth</Text>
                        </View>
                        <View style={styles.metricCard}> 
                            <Text style={styles.metricValue}>🤝</Text>
                            <Text style={styles.metricLabel}>Community</Text>
                        </View>
                    </View>
                </View>

                {/* Dual feature glass card */}
                <View style={styles.glassShell}> 
                    <View style={styles.glassInner}> 
                        <Text style={styles.sectionHeading}>Who is this for?</Text>
                        <View style={styles.dualColumns}> 
                            <View style={styles.featureColumn}> 
                                <View style={styles.columnHeaderRow}> 
                                    <MaterialIcons name="person-pin-circle" size={20} color="#1976d2" />
                                    <Text style={styles.columnHeader}>Clients</Text>
                                </View>
                                <View style={styles.bulletItem}> 
                                    <MaterialIcons name="search" size={16} color="#0d47a1" style={styles.bulletIcon} />
                                    <Text style={styles.bulletText}>Discover lessons that match interests</Text>
                                </View>
                                <View style={styles.bulletItem}> 
                                    <MaterialIcons name="event-available" size={16} color="#0d47a1" style={styles.bulletIcon} />
                                    <Text style={styles.bulletText}>Register instantly & manage spots</Text>
                                </View>
                                <View style={styles.bulletItem}> 
                                    <MaterialIcons name="person-search" size={16} color="#0d47a1" style={styles.bulletIcon} />
                                    <Text style={styles.bulletText}>View coach profiles & credibility</Text>
                                </View>
                            </View>
                            <View style={styles.dividerVertical} />
                            <View style={styles.featureColumn}> 
                                <View style={styles.columnHeaderRow}> 
                                    <MaterialIcons name="sports-handball" size={20} color="#1976d2" />
                                    <Text style={styles.columnHeader}>Coaches</Text>
                                </View>
                                <View style={styles.bulletItem}> 
                                    <MaterialIcons name="add-circle-outline" size={16} color="#0d47a1" style={styles.bulletIcon} />
                                    <Text style={styles.bulletText}>Create & promote lessons easily</Text>
                                </View>
                                <View style={styles.bulletItem}> 
                                    <MaterialIcons name="group" size={16} color="#0d47a1" style={styles.bulletIcon} />
                                    <Text style={styles.bulletText}>Track attendance & capacity</Text>
                                </View>
                                <View style={styles.bulletItem}> 
                                    <MaterialIcons name="insights" size={16} color="#0d47a1" style={styles.bulletIcon} />
                                    <Text style={styles.bulletText}>Grow reach & reputation</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Roadmap / Coming soon */}
                <View style={styles.roadmapCard}> 
                    <View style={styles.roadmapHeaderRow}> 
                        <MaterialIcons name="auto-graph" size={20} color="#ffffff" />
                        <Text style={styles.roadmapTitle}>What’s Coming</Text>
                    </View>
                    <View style={styles.roadmapList}> 
                        <View style={styles.roadmapItem}> 
                            <View style={styles.dot} />
                            <Text style={styles.roadmapText}>Social feed & activity stream</Text>
                        </View>
                        <View style={styles.roadmapItem}> 
                            <View style={styles.dot} />
                            <Text style={styles.roadmapText}>Progress tracking & achievements</Text>
                        </View>
                        <View style={styles.roadmapItem}> 
                            <View style={styles.dot} />
                            <Text style={styles.roadmapText}>Advanced coach analytics</Text>
                        </View>
                        <View style={styles.roadmapItem}> 
                            <View style={styles.dot} />
                            <Text style={styles.roadmapText}>Enhanced location discovery</Text>
                        </View>
                    </View>
                    <View style={styles.roadmapFooterRow}> 
                        <Text style={styles.roadmapFooterText}>You are early — thanks for shaping the platform!</Text>
                    </View>
                </View>

                {/* Quick Tips */}
                <View style={styles.quickTipsCard}> 
                    <Text style={styles.quickTipsTitle}>Quick Tips</Text>
                    <View style={styles.tipRow}> 
                        <MaterialIcons name="touch-app" size={18} color="#0d47a1" />
                        <Text style={styles.tipText}>Tap lessons to view full details & register quickly.</Text>
                    </View>
                    <View style={styles.tipRow}> 
                        <MaterialIcons name="calendar-month" size={18} color="#0d47a1" />
                        <Text style={styles.tipText}>Use the calendar to visualize your weekly activity.</Text>
                    </View>
                    <View style={styles.tipRow}> 
                        <MaterialIcons name="star-border" size={18} color="#0d47a1" />
                        <Text style={styles.tipText}>Coach quality indicators are coming soon.</Text>
                    </View>
                </View>

                <Text style={styles.footer}>Use the side menu to explore the app.</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientBg:{ flex:1 },
    scrollContent:{ paddingBottom:60, paddingTop:Platform.OS==='ios'? 56:40 },
    heroWrapper:{ paddingHorizontal:22, paddingBottom:8 },
    title:{ fontSize:32, color:'#ffffff', fontWeight:'800', letterSpacing:0.5, marginBottom:12 },
    titleMobile:{ fontSize:26 },
    subtitle:{ fontSize:15, color:'rgba(255,255,255,0.85)', marginBottom:28, fontWeight:'600', lineHeight:22 },
    subtitleMobile:{ fontSize:14 },
    heroMetricRow:{ flexDirection:'row', gap:14 },
    metricCard:{ flex:1, backgroundColor:'rgba(255,255,255,0.14)', paddingVertical:16, borderRadius:18, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.28)', shadowColor:'#000', shadowOpacity:0.20, shadowRadius:10, shadowOffset:{width:0,height:4} },
    metricValue:{ fontSize:20 },
    metricLabel:{ marginTop:6, fontSize:11, fontWeight:'700', color:'#ffffff', letterSpacing:0.5 },

    glassShell:{ marginHorizontal:18, marginTop:34, borderRadius:30, overflow:'hidden', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:18, shadowOffset:{width:0,height:8} },
    glassInner:{ backgroundColor:'rgba(255,255,255,0.16)', padding:22, borderWidth:1, borderColor:'rgba(255,255,255,0.32)', borderRadius:30 },
    sectionHeading:{ fontSize:18, fontWeight:'800', color:'#ffffff', marginBottom:18, letterSpacing:0.5 },
    dualColumns:{ flexDirection:'row', gap:18 },
    featureColumn:{ flex:1 },
    columnHeaderRow:{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:10 },
    columnHeader:{ fontSize:15, fontWeight:'800', color:'#0d47a1', backgroundColor:'#ffffff', paddingHorizontal:12, paddingVertical:6, borderRadius:14, overflow:'hidden', borderWidth:1, borderColor:'rgba(13,71,161,0.20)' },
    bulletItem:{ flexDirection:'row', alignItems:'flex-start', gap:8, marginBottom:10 },
    bulletIcon:{ marginTop:2 },
    bulletText:{ flex:1, fontSize:13.5, fontWeight:'600', color:'rgba(255,255,255,0.90)', lineHeight:19 },
    dividerVertical:{ width:1, backgroundColor:'rgba(255,255,255,0.28)', borderRadius:1 },

    roadmapCard:{ marginTop:40, marginHorizontal:18, backgroundColor:'rgba(255,255,255,0.15)', borderRadius:28, padding:22, borderWidth:1, borderColor:'rgba(255,255,255,0.30)', shadowColor:'#000', shadowOpacity:0.20, shadowRadius:14, shadowOffset:{width:0,height:6} },
    roadmapHeaderRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
    roadmapTitle:{ fontSize:16, fontWeight:'800', color:'#ffffff', letterSpacing:0.4 },
    roadmapList:{ marginTop:4, marginBottom:10 },
    roadmapItem:{ flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:10 },
    dot:{ width:10, height:10, borderRadius:5, backgroundColor:'#64b5f6', marginTop:4 },
    roadmapText:{ flex:1, fontSize:13.5, fontWeight:'600', color:'rgba(255,255,255,0.92)', lineHeight:19 },
    roadmapFooterRow:{ marginTop:4 },
    roadmapFooterText:{ fontSize:12, fontWeight:'700', color:'rgba(255,255,255,0.80)', letterSpacing:0.4 },

    quickTipsCard:{ marginTop:34, marginHorizontal:18, backgroundColor:'rgba(255,255,255,0.14)', padding:22, borderRadius:26, borderWidth:1, borderColor:'rgba(255,255,255,0.28)', shadowColor:'#000', shadowOpacity:0.18, shadowRadius:14, shadowOffset:{width:0,height:6} },
    quickTipsTitle:{ fontSize:16, fontWeight:'800', color:'#ffffff', marginBottom:16, letterSpacing:0.5 },
    tipRow:{ flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:12 },
    tipText:{ flex:1, fontSize:13, fontWeight:'600', color:'rgba(255,255,255,0.88)', lineHeight:19 },

    footer:{ marginTop:46, textAlign:'center', color:'rgba(255,255,255,0.85)', fontWeight:'600', fontSize:13, letterSpacing:0.4 },

    decorBubbleOne:{ position:'absolute', top:-70, left:-50, width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.07)' },
    decorBubbleTwo:{ position:'absolute', top:220, right:-60, width:240, height:240, borderRadius:120, backgroundColor:'rgba(255,255,255,0.05)' },
    decorBubbleThree:{ position:'absolute', bottom:-90, left:-40, width:180, height:180, borderRadius:90, backgroundColor:'rgba(255,255,255,0.06)' },
});
