import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function NavbarBreadcrumbs() {
  const routes = useNavigationState((state) => state.routes);

  const breadcrumbs = routes.map((route) => route.name);

  return (
      <View style={styles.container}>
        {breadcrumbs.map((name, index) => (
            <View key={index} style={styles.breadcrumbItem}>
              <Text style={styles.text}>{name}</Text>
              {index < breadcrumbs.length - 1 && (
                  <MaterialIcons name="navigate-next" size={16} color="#ccc" />
              )}
            </View>
        ))}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 2,
  },
});
