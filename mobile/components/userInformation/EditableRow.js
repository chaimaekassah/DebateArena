import {
  View,
  TextInput,
  TouchableOpacity,
  Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Label, Colors } from "../styles";

const { grey, white, dark, blue, yellow } = Colors;

const EditableRow = ({
  icon,
  label,
  value,
  onChange,
  isEditing,
  onPress,
  secure = false,
  keyboardType = "default",
  autoCapitalize = "sentences"
}) => {
  const handleBlur = () => {
    Keyboard.dismiss();
  };

  const handlePress = () => {
    if (isEditing) {
      Keyboard.dismiss();
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 12,
        backgroundColor: white,
        borderRadius: 10
      }}
    >
      {/* Icône */}
      <Ionicons
        name={icon}
        size={22}
        color={yellow}
      />

      {/* Label */}
      <Label
        style={{
          marginLeft: 10,
          fontSize: 14,
          color: grey,
          minWidth: 90,
          textAlign: "left" 
        }}
      >
        {label}
      </Label>

      {/* Valeur / Input */}
      <View style={{ flex: 1 }}>
        {isEditing ? (
          <TextInput
            value={value}
            onChangeText={onChange}
            autoFocus
            secureTextEntry={secure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onBlur={handleBlur}
            onSubmitEditing={handleBlur}
            returnKeyType="done"
            style={{
              fontSize: 16,
              paddingVertical: 4,
              textAlign: "right",
              color: dark
            }}
          />
        ) : (
          <Label
            style={{
              fontSize: 16,
              textAlign: "right",
              color: value ? dark : grey
            }}
            numberOfLines={1}
          >
            {secure && value ? "••••••••" : value || "Non défini"}
          </Label>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default EditableRow;
