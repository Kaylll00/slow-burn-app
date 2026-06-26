import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function SettingRow({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
  rightElement,
  last = false,
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, last && styles.lastRow]}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
      </View>

      <View style={styles.right}>
        {value ? <Text style={[styles.value, danger && styles.danger]}>{value}</Text> : null}
        {rightElement}
        {showArrow && !rightElement ? <Text style={[styles.arrow, danger && styles.danger]}>{'›'}</Text> : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  left: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  label: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '500',
  },
  value: {
    color: '#666666',
    fontSize: 14,
  },
  arrow: {
    color: '#999999',
    fontSize: 20,
    marginLeft: 8,
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  danger: {
    color: '#F44336',
  },
})