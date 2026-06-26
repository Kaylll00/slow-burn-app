import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { CURRENCIES } from '../../services/profileService'

export default function CurrencyPicker({ visible, currentCurrency, onSelect, onCancel }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Choose Currency</Text>

          {CURRENCIES.map((currency) => {
            const active = currency.code === currentCurrency
            return (
              <Pressable key={currency.code} onPress={() => onSelect(currency.code)} style={styles.row}>
                <Text style={styles.rowText}>
                  {currency.symbol} {currency.code} - {currency.name}
                </Text>
                <Text style={[styles.check, active && styles.activeCheck]}>{active ? '✓' : ''}</Text>
              </Pressable>
            )
          })}

          <Pressable onPress={onCancel} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#E5E5E5',
    borderRadius: 999,
    height: 4,
    marginBottom: 16,
    width: 48,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  rowText: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '500',
  },
  check: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    width: 18,
  },
  activeCheck: {
    color: '#FF5722',
  },
  cancel: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelText: {
    color: '#666666',
    fontWeight: '600',
  },
})