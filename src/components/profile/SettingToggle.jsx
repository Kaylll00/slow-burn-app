import { Switch } from 'react-native'
import SettingRow from './SettingRow'

export default function SettingToggle({ icon, label, value, onToggle }) {
  return (
    <SettingRow
      icon={icon}
      label={label}
      showArrow={false}
      rightElement={
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#CCCCCC', true: '#FF5722' }}
          thumbColor="#FFFFFF"
        />
      }
    />
  )
}