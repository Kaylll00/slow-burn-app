import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="waiting" options={{ title: 'Waiting' }} />
      <Tabs.Screen name="bought" options={{ title: 'Bought' }} />
      <Tabs.Screen name="cured" options={{ title: 'Cured' }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: '👤 Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  )
}
