# React Native Alert Dialogs: Complete Guide

## 🎯 What is Alert?

**Alert** is React Native's built-in API for displaying native alert dialogs. It provides a simple way to show:
- **Information messages** - Tell users something important
- **Confirmation dialogs** - Ask users to confirm actions
- **Error messages** - Show errors or warnings
- **Input prompts** - Get user input (iOS only)

---

## 📱 Basic Alert Usage

### Simple Alert (Information)

```javascript
import { Alert } from 'react-native';

Alert.alert('Title', 'Message');
```

**Result:**
- Shows a native dialog with title and message
- Single "OK" button
- User taps OK to dismiss

### Alert with Custom Button

```javascript
Alert.alert(
  'Title',
  'Message',
  [
    {
      text: 'OK',
      onPress: () => console.log('OK pressed')
    }
  ]
);
```

---

## 🔔 Alert.alert() Parameters

### Full Signature

```javascript
Alert.alert(
  title,           // String: Dialog title
  message,         // String: Dialog message (optional)
  buttons,         // Array: Button configurations (optional)
  options          // Object: Additional options (optional)
);
```

### Parameter Breakdown

#### 1. **title** (required)
- Type: `string`
- The title shown at the top of the dialog

#### 2. **message** (optional)
- Type: `string`
- The message/body text shown below the title

#### 3. **buttons** (optional)
- Type: `Array<ButtonConfig>`
- Array of button configurations
- If omitted, shows default "OK" button

#### 4. **options** (optional)
- Type: `Object`
- Additional configuration options

---

## 🎨 Button Configuration

### Button Object Structure

```javascript
{
  text: 'Button Text',        // Required: Button label
  onPress: () => {},          // Optional: Function to call when pressed
  style: 'default' | 'cancel' | 'destructive'  // Optional: Button style
}
```

### Button Styles

#### 1. **'default'** (default)
- Normal button appearance
- Used for primary actions

#### 2. **'cancel'**
- **iOS**: Shows in bold, typically on the left
- **Android**: Shows as cancel button
- Usually used for "Cancel" or "No" actions

#### 3. **'destructive'**
- **iOS**: Shows in red
- **Android**: Shows as destructive action
- Used for dangerous actions (delete, wipe, etc.)

### Button Examples

```javascript
// Default button
{
  text: 'OK',
  onPress: () => console.log('OK')
}

// Cancel button
{
  text: 'Cancel',
  style: 'cancel',
  onPress: () => console.log('Cancelled')
}

// Destructive button
{
  text: 'Delete',
  style: 'destructive',
  onPress: () => deleteItem()
}
```

---

## 📋 Common Alert Patterns

### Pattern 1: Confirmation Dialog

```javascript
Alert.alert(
  'Confirm Action',
  'Are you sure you want to proceed?',
  [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: () => console.log('Cancelled')
    },
    {
      text: 'Confirm',
      onPress: () => {
        // Execute action
        performAction();
      }
    }
  ]
);
```

**Result:**
- Two buttons: "Cancel" and "Confirm"
- Cancel button is styled as cancel
- Confirm button executes the action

### Pattern 2: Destructive Action Confirmation

```javascript
Alert.alert(
  'Delete Item',
  'This action cannot be undone. Are you sure?',
  [
    {
      text: 'Cancel',
      style: 'cancel'
    },
    {
      text: 'Delete',
      style: 'destructive',  // Shows in red
      onPress: () => deleteItem()
    }
  ]
);
```

**Result:**
- Cancel button (normal)
- Delete button (red/destructive)
- Clear visual indication of dangerous action

### Pattern 3: Three Buttons

```javascript
Alert.alert(
  'Choose Action',
  'What would you like to do?',
  [
    {
      text: 'Cancel',
      style: 'cancel'
    },
    {
      text: 'Save',
      onPress: () => save()
    },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: () => delete()
    }
  ]
);
```

**Note:** On iOS, only the first button can be 'cancel'. On Android, you can have multiple buttons.

### Pattern 4: Information Alert

```javascript
Alert.alert(
  'Success',
  'Your data has been saved successfully!',
  [{ text: 'OK' }]
);
```

**Result:**
- Simple informational message
- Single OK button

### Pattern 5: Error Alert

```javascript
Alert.alert(
  'Error',
  'Something went wrong. Please try again.',
  [{ text: 'OK' }]
);
```

---

## ⚙️ Options Configuration

### Available Options

```javascript
Alert.alert(
  'Title',
  'Message',
  [/* buttons */],
  {
    cancelable: true,  // Android: Allow dismissing by tapping outside
    userInterfaceStyle: 'light' | 'dark' | 'automatic'  // iOS: Interface style
  }
);
```

### Options Explained

#### **cancelable** (Android only)
- Type: `boolean`
- Default: `true`
- If `true`, user can dismiss by tapping outside the dialog
- If `false`, user must tap a button

#### **userInterfaceStyle** (iOS only)
- Type: `'light' | 'dark' | 'automatic'`
- Controls the appearance style
- `'automatic'` follows system setting

---

## 🎯 Our Emergency Wipe Implementation

### Complete Example

```javascript
const handlePanicButtonPress = () => {
  Alert.alert(
    'Emergency Wipe',  // Title
    'This will delete all stored data and log you out. This action cannot be undone.\n\nAre you sure you want to continue?',  // Message
    [
      {
        text: 'Cancel',
        style: 'cancel',  // Cancel button style
        onPress: () => {
          console.log('Emergency wipe cancelled');
        }
      },
      {
        text: 'Wipe All Data',
        style: 'destructive',  // Red/destructive button
        onPress: emergencyWipe  // Execute emergency wipe
      }
    ],
    {
      cancelable: true  // Allow dismissing by tapping outside (Android)
    }
  );
};
```

### How It Works

1. **User taps panic button** → `handlePanicButtonPress()` is called
2. **Alert dialog appears** with title and message
3. **Two buttons shown:**
   - "Cancel" (cancel style) - Does nothing
   - "Wipe All Data" (destructive style, red) - Executes `emergencyWipe()`
4. **User chooses:**
   - Cancel → Dialog closes, nothing happens
   - Wipe All Data → `emergencyWipe()` executes

---

## 🔍 Platform Differences

### iOS Behavior

- **Cancel button**: Shows in bold, typically on the left
- **Destructive button**: Shows in red
- **Button order**: Cancel typically appears first
- **Dismissal**: Must tap a button (no tap outside to dismiss)

### Android Behavior

- **Cancel button**: Shows as cancel action
- **Destructive button**: Shows as destructive action
- **Button order**: Can be customized
- **Dismissal**: Can tap outside if `cancelable: true`

---

## 💡 Best Practices

### 1. **Always Provide a Cancel Option**

```javascript
// ✅ Good
Alert.alert(
  'Delete',
  'Are you sure?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: delete }
  ]
);

// ❌ Bad - No way to cancel
Alert.alert(
  'Delete',
  'Are you sure?',
  [{ text: 'Delete', onPress: delete }]
);
```

### 2. **Use Destructive Style for Dangerous Actions**

```javascript
// ✅ Good - Clear visual indication
{
  text: 'Delete All Data',
  style: 'destructive',  // Red button
  onPress: deleteAll
}

// ❌ Bad - Looks like normal action
{
  text: 'Delete All Data',
  onPress: deleteAll
}
```

### 3. **Provide Clear Messages**

```javascript
// ✅ Good - Clear and specific
Alert.alert(
  'Emergency Wipe',
  'This will delete all stored data and log you out. This action cannot be undone.\n\nAre you sure you want to continue?'
);

// ❌ Bad - Vague
Alert.alert(
  'Warning',
  'Are you sure?'
);
```

### 4. **Handle Button Presses**

```javascript
// ✅ Good - Handles both actions
Alert.alert(
  'Confirm',
  'Proceed?',
  [
    {
      text: 'Cancel',
      onPress: () => console.log('Cancelled')
    },
    {
      text: 'OK',
      onPress: () => performAction()
    }
  ]
);

// ❌ Bad - No handlers
Alert.alert(
  'Confirm',
  'Proceed?',
  [
    { text: 'Cancel' },
    { text: 'OK' }
  ]
);
```

### 5. **Use Cancelable for Non-Critical Alerts**

```javascript
// ✅ Good - Can dismiss by tapping outside
Alert.alert(
  'Info',
  'This is just information',
  [{ text: 'OK' }],
  { cancelable: true }
);

// ✅ Good - Must confirm for critical actions
Alert.alert(
  'Delete',
  'This cannot be undone',
  [/* buttons */],
  { cancelable: false }  // Force user to choose
);
```

---

## 🎨 Visual Examples

### iOS Alert

```
┌─────────────────────────┐
│   Emergency Wipe        │ ← Title
├─────────────────────────┤
│   This will delete all   │
│   stored data and log   │ ← Message
│   you out. This action  │
│   cannot be undone.      │
│                         │
│   Are you sure you want │
│   to continue?          │
├─────────────────────────┤
│  [Cancel]  [Wipe All]  │ ← Buttons
│   (bold)    (red)       │
└─────────────────────────┘
```

### Android Alert

```
┌─────────────────────────┐
│   Emergency Wipe        │ ← Title
├─────────────────────────┤
│   This will delete all   │
│   stored data and log   │ ← Message
│   you out. This action  │
│   cannot be undone.      │
│                         │
│   Are you sure you want │
│   to continue?          │
├─────────────────────────┤
│  [Cancel]               │ ← Buttons
│  [Wipe All Data]        │
│   (destructive)         │
└─────────────────────────┘
```

---

## 🔧 Advanced Usage

### Conditional Buttons

```javascript
const showAlert = (hasPermission) => {
  const buttons = [
    { text: 'Cancel', style: 'cancel' }
  ];
  
  if (hasPermission) {
    buttons.push({
      text: 'Delete',
      style: 'destructive',
      onPress: deleteItem
    });
  }
  
  Alert.alert('Delete', 'Are you sure?', buttons);
};
```

### Async Operations in onPress

```javascript
Alert.alert(
  'Save',
  'Save your changes?',
  [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Save',
      onPress: async () => {
        try {
          await saveData();
          Alert.alert('Success', 'Data saved!');
        } catch (error) {
          Alert.alert('Error', 'Failed to save');
        }
      }
    }
  ]
);
```

---

## ⚠️ Limitations

### 1. **No Custom Styling**
- Cannot customize colors, fonts, or layout
- Must use native platform styling

### 2. **Limited to Native Dialogs**
- Cannot create custom modal designs
- For custom designs, use `Modal` component instead

### 3. **iOS Input Prompts**
- `Alert.prompt()` exists but is iOS-only
- For cross-platform input, use `Modal` with `TextInput`

### 4. **Button Limit**
- iOS: Recommended max 2 buttons
- Android: Can have more, but not recommended

---

## 🎓 Key Takeaways

1. **Alert.alert()** - Simple API for native dialogs
2. **Button styles** - Use 'destructive' for dangerous actions
3. **Always provide cancel** - Give users a way out
4. **Clear messages** - Be specific about what will happen
5. **Platform differences** - iOS and Android behave slightly differently
6. **Options** - Use `cancelable` and `userInterfaceStyle` for fine-tuning

---

## 📚 Additional Resources

- [React Native Alert Documentation](https://reactnative.dev/docs/alert)
- [iOS Human Interface Guidelines - Alerts](https://developer.apple.com/design/human-interface-guidelines/components/presentation/alerts/)
- [Material Design - Dialogs](https://material.io/components/dialogs)

---

**Remember:** Alert dialogs are perfect for confirmations and important messages. For custom designs or complex interactions, use the `Modal` component instead! 🎯

