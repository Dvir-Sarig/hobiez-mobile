import React, { JSX } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

interface MenuItem {
  text: string;
  icon: JSX.Element;
  route: string;
}

interface MenuContentProps {
  userType: 'client' | 'coach';
  onItemClick?: () => void;
}

export default function MenuContent({ userType, onItemClick }: MenuContentProps) {
  const navigation = useNavigation<DrawerNavigationProp<Record<string, object | undefined>>>();

  const commonMenuItems: MenuItem[] = [
    { text: 'Home', icon: <Ionicons name="home" size={22} color="white" />, route: 'Home' },
    { text: 'Profile', icon: <Ionicons name="person" size={22} color="white" />, route: 'Profile' },
    { text: 'Analytics', icon: <FontAwesome5 name="chart-line" size={20} color="white" />, route: 'Analytics' },
    { text: 'About', icon: <Ionicons name="information-circle" size={22} color="white" />, route: 'About' },
  ];
  
  const roleSpecificItem: MenuItem =
    userType === 'coach'
      ? { text: 'My Lessons', icon: <MaterialIcons name="fitness-center" size={22} color="white" />, route: 'CoachLessons' }
      : { text: 'Search Lessons', icon: <Ionicons name="search" size={22} color="white" />, route: 'SearchLessons' };  

  const menuItems = [commonMenuItems[0], roleSpecificItem, ...commonMenuItems.slice(1)];

  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.menuItem}
          onPress={() => {
            navigation.dispatch(DrawerActions.jumpTo(item.route));
            if (onItemClick) onItemClick();
          }}                           
        >
          <View style={styles.iconContainer}>{item.icon}</View>
          <Text style={styles.menuText}>{item.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1565c0',
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
