import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';

export default function CreateStoreScreen({ navigation }) {
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [storeCoordinates, setStoreCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState([
    { id: 1, url: '', platform: 'link' },
    { id: 2, url: '', platform: 'link' },
    { id: 3, url: '', platform: 'link' },
    { id: 4, url: '', platform: 'link' }
  ]);
  const { currentUser, isGuestUser } = useAuth();

  // Store categories
  const storeCategories = [
    { id: 'sari-sari', name: 'Sari-sari Store', icon: 'storefront' },
    { id: 'kainan', name: 'Kainan/Restaurant', icon: 'restaurant' },
    { id: 'laundry', name: 'Laundry Shop', icon: 'shirt' },
    { id: 'vegetables', name: 'Vegetable Store', icon: 'leaf' },
    { id: 'meat', name: 'Meat Shop', icon: 'fish' },
    { id: 'bakery', name: 'Bakery', icon: 'cafe' },
    { id: 'pharmacy', name: 'Pharmacy', icon: 'medical' },
    { id: 'hardware', name: 'Hardware Store', icon: 'hammer' },
    { id: 'clothing', name: 'Clothing Store', icon: 'shirt-outline' },
    { id: 'electronics', name: 'Electronics', icon: 'phone-portrait' },
    { id: 'beauty', name: 'Beauty Salon', icon: 'cut' },
    { id: 'automotive', name: 'Automotive Shop', icon: 'car' },
    { id: 'other', name: 'Other', icon: 'business' },
  ];

  // Function to detect social platform from URL
  const detectPlatform = (url) => {
    if (!url) return 'link';
    
    const normalizedUrl = url.toLowerCase();
    
    if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.com')) return 'facebook';
    if (normalizedUrl.includes('instagram.com')) return 'instagram';
    if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) return 'twitter';
    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) return 'youtube';
    if (normalizedUrl.includes('tiktok.com')) return 'tiktok';
    if (normalizedUrl.includes('linkedin.com')) return 'linkedin';
    if (normalizedUrl.includes('whatsapp.com') || normalizedUrl.includes('wa.me')) return 'whatsapp';
    if (normalizedUrl.includes('telegram.org') || normalizedUrl.includes('t.me')) return 'telegram';
    if (normalizedUrl.includes('viber.com')) return 'viber';
    if (normalizedUrl.includes('shopee.ph') || normalizedUrl.includes('shopee.com')) return 'shopee';
    if (normalizedUrl.includes('lazada.com.ph') || normalizedUrl.includes('lazada.com')) return 'lazada';
    
    return 'link';
  };

  // Function to get platform icon
  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: 'logo-facebook',
      instagram: 'logo-instagram', 
      twitter: 'logo-twitter',
      youtube: 'logo-youtube',
      tiktok: 'logo-tiktok',
      linkedin: 'logo-linkedin',
      whatsapp: 'logo-whatsapp',
      telegram: 'send',
      viber: 'call',
      shopee: 'storefront',
      lazada: 'bag',
      link: 'link'
    };
    return icons[platform] || 'link';
  };

  // Function to get platform color
  const getPlatformColor = (platform) => {
    const colors = {
      facebook: '#1877F2',
      instagram: '#E4405F',
      twitter: '#1DA1F2', 
      youtube: '#FF0000',
      tiktok: '#000000',
      linkedin: '#0A66C2',
      whatsapp: '#25D366',
      telegram: '#0088CC',
      viber: '#665CAC',
      shopee: '#FF5722',
      lazada: '#0F146D',
      link: '#6B7280'
    };
    return colors[platform] || '#6B7280';
  };

  // Function to update social link
  const updateSocialLink = (id, url) => {
    const platform = detectPlatform(url);
    setSocialLinks(prev => 
      prev.map(link => 
        link.id === id 
          ? { ...link, url: url.trim(), platform }
          : link
      )
    );
  };

  // Function to remove social link
  const removeSocialLink = (id) => {
    setSocialLinks(prev => 
      prev.map(link => 
        link.id === id 
          ? { ...link, url: '', platform: 'link' }
          : link
      )
    );
  };

  // If user is a guest, show the guest restriction screen
  if (isGuestUser()) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView contentContainerStyle={styles.guestScrollContainer}>
            <View style={styles.guestContainer}>
              {/* Header */}
              <View style={styles.guestHeader}>
                <View style={styles.iconContainer}>
                  <Image 
                    source={require('../../assets/lokalfinds-logo.png')} 
                    style={styles.guestLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.guestTitle}>Gusto mo bang magkaroon ng sariling tindahan?</Text>
                <Text style={styles.guestSubtitle}>
                  Mga guest user ay hindi pwedeng mag-create ng store. Mag-register muna para sa full access!
                </Text>
              </View>

              {/* Benefits Section */}
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Benefits ng pagkakaroon ng Store:</Text>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="cash" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Mag-earn ng extra income</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="people" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Maging kilala sa inyong community</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="trending-up" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Palakihin ang inyong business</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="phone-portrait" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Madaling ma-contact ng mga customers</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="shield-checkmark" size={24} color={Colors.accent} />
                  <Text style={styles.benefitText}>Secure at trusted platform</Text>
                </View>
              </View>

              {/* Call to Action */}
              <View style={styles.ctaContainer}>
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
                >
                  <Ionicons name="person-add" size={20} color={Colors.text.white} style={styles.buttonIcon} />
                  <Text style={styles.signupButtonText}>Mag-register ngayon!</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.backButtonText}>Bumalik sa Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  const handleCreateStore = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create a store');
        return;
      }

      // Validate form data
      if (!storeName.trim() || !address.trim() || !hours.trim() || !description.trim() || !category) {
        Alert.alert('Error', 'Please fill in all required fields including store category');
        return;
      }

      setLoading(true);

      // Filter out empty social links
      const validSocialLinks = socialLinks.filter(link => link.url.trim() !== '');

      const storeData = {
        name: storeName.trim(),
        address: address.trim(),
        hours: hours.trim(),
        description: description.trim(),
        category: category,
        profileImage: profileImage || '', // Store the image URI or empty string as placeholder
        coverImage: coverImage || '', // Store the image URI or empty string as placeholder
        coordinates: storeCoordinates, // Store GPS coordinates for accurate map positioning
        socialLinks: validSocialLinks, // Add social links to store data
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'stores'), storeData);
      console.log('✅ Store created with ID:', docRef.id);
      
      Alert.alert('Success', 'Store created successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back to MyStore tab and refresh
            navigation.navigate('MyStoreMain');
          }
        }
      ]);

    } catch (error) {
      console.error('❌ Error creating store:', error);
      Alert.alert('Error', `Failed to create store: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Image picker functions
  const pickImage = async (imageType) => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: imageType === 'profile' ? [1, 1] : [16, 9], // Square for profile, widescreen for cover
        quality: 0.8,
      });

      if (!result.canceled) {
        if (imageType === 'profile') {
          setProfileImage(result.assets[0].uri);
        } else {
          setCoverImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const removeImage = (imageType) => {
    if (imageType === 'profile') {
      setProfileImage(null);
    } else {
      setCoverImage(null);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to auto-detect your address. Please enable location access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                Location.requestForegroundPermissionsAsync();
              }
            }
          ]
        );
        return;
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeout: 15000,
        maximumAge: 10000,
      });

      console.log('📍 Current location detected:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      // Store coordinates for the store
      const coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      setStoreCoordinates(coordinates);

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        
        // Format the address
        let formattedAddress = '';
        if (addr.streetNumber) formattedAddress += addr.streetNumber + ' ';
        if (addr.street) formattedAddress += addr.street + ', ';
        if (addr.district) formattedAddress += addr.district + ', ';
        if (addr.city) formattedAddress += addr.city + ', ';
        if (addr.region) formattedAddress += addr.region + ', ';
        if (addr.country) formattedAddress += addr.country;
        
        // Remove trailing comma and space
        formattedAddress = formattedAddress.replace(/,\s*$/, '');
        
        if (formattedAddress) {
          setAddress(formattedAddress);
          Alert.alert(
            'Location Detected!', 
            `Address: ${formattedAddress}\n\nCoordinates: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}\nAccuracy: ${Math.round(location.coords.accuracy)}m`
          );
        } else {
          throw new Error('Could not format address');
        }
      } else {
        throw new Error('No address found for this location');
      }

    } catch (error) {
      console.error('❌ Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Could not detect your location. Please enter your address manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // For testing: Allow manual coordinate input (development only)
  const setTestCoordinates = () => {
    Alert.prompt(
      'Set Test Coordinates',
      'Enter coordinates as: latitude,longitude\n(Example: 14.5995,120.9842 for Manila)',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Set',
          onPress: (input) => {
            try {
              const [lat, lng] = input.split(',').map(coord => parseFloat(coord.trim()));
              if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                setStoreCoordinates({ latitude: lat, longitude: lng });
                Alert.alert(
                  'Test Coordinates Set!', 
                  `Latitude: ${lat}\nLongitude: ${lng}\n\nNote: This is for testing only.`
                );
              } else {
                Alert.alert('Error', 'Invalid format. Use: latitude,longitude');
              }
            } catch (error) {
              Alert.alert('Error', 'Invalid format. Use: latitude,longitude');
            }
          },
        },
      ],
      'plain-text',
      '14.5995,120.9842'
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>Create Your Store</Text>
          <Text style={styles.subtitle}>
            Set up your store profile to start connecting with local customers
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your store name"
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Category *</Text>
            <Text style={styles.subtitle}>Select what type of store you have</Text>
            <View style={styles.categoryContainer}>
              {storeCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonSelected
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons 
                    name={cat.icon} 
                    size={20} 
                    color={category === cat.id ? '#fff' : '#3498db'} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat.id && styles.categoryButtonTextSelected
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Store Images Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Images</Text>
            <Text style={styles.subtitle}>Add profile and cover photos to make your store more attractive</Text>
            
            {/* Profile Image */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Profile Picture</Text>
              <View style={styles.imageContainer}>
                {profileImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: profileImage }} style={styles.profileImagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={() => removeImage('profile')}
                    >
                      <Ionicons name="close-circle" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.addImageButton} 
                    onPress={() => pickImage('profile')}
                  >
                    <Ionicons name="camera" size={40} color="#bdc3c7" />
                    <Text style={styles.addImageText}>Add Profile Picture</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Cover Image */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Cover Photo</Text>
              <View style={styles.imageContainer}>
                {coverImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: coverImage }} style={styles.coverImagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={() => removeImage('cover')}
                    >
                      <Ionicons name="close-circle" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.addCoverImageButton} 
                    onPress={() => pickImage('cover')}
                  >
                    <Ionicons name="image" size={40} color="#bdc3c7" />
                    <Text style={styles.addImageText}>Add Cover Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Address *</Text>
              <TouchableOpacity
                style={[styles.locationButton, locationLoading && styles.locationButtonDisabled]}
                onPress={getCurrentLocation}
                disabled={locationLoading}
              >
                <Ionicons 
                  name={locationLoading ? "reload" : "location"} 
                  size={16} 
                  color={locationLoading ? "#95a5a6" : Colors.primary} 
                />
                <Text style={[styles.locationButtonText, locationLoading && styles.locationButtonTextDisabled]}>
                  {locationLoading ? 'Detecting...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your store address"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            
            {/* Test coordinate button for development */}
            <TouchableOpacity 
              style={[styles.button, styles.testButton]} 
              onPress={setTestCoordinates}
            >
              <Text style={styles.buttonText}>Set Test Coordinates (Dev)</Text>
            </TouchableOpacity>
            
            {/* Display current coordinates */}
            {storeCoordinates && (
              <View style={styles.coordinateDisplay}>
                <Text style={styles.coordinateText}>
                  📍 GPS Coordinates: {storeCoordinates.latitude.toFixed(6)}, {storeCoordinates.longitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinateSubtext}>
                  These coordinates will be used for precise map positioning
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Operating Hours *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM"
              value={hours}
              onChangeText={setHours}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>About Your Store *</Text>
            <Text style={styles.subtitle}>Tell customers about your store, what you sell, your contact info, and your story...</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your store, products, contact information (phone, email, etc.), and your story..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Social Links Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Social Links & Online Presence</Text>
            <Text style={styles.subtitle}>Add up to 4 links to your social media, website, or online stores (Facebook, Instagram, Shopee, etc.)</Text>
            
            <View style={styles.socialLinksContainer}>
              {socialLinks.map((link, index) => (
                <View key={link.id} style={styles.socialLinkItem}>
                  <View style={styles.socialLinkInputContainer}>
                    <View style={[styles.platformIcon, { backgroundColor: getPlatformColor(link.platform) }]}>
                      <Ionicons 
                        name={getPlatformIcon(link.platform)} 
                        size={20} 
                        color="#fff" 
                      />
                    </View>
                    <TextInput
                      style={styles.socialLinkInput}
                      placeholder={`Link ${index + 1} - Enter URL (e.g., https://facebook.com/yourstore)`}
                      value={link.url}
                      onChangeText={(text) => updateSocialLink(link.id, text)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                    />
                    {link.url !== '' && (
                      <TouchableOpacity 
                        style={styles.removeLinkButton}
                        onPress={() => removeSocialLink(link.id)}
                      >
                        <Ionicons name="close" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {link.url !== '' && (
                    <View style={styles.platformPreview}>
                      <Text style={styles.platformName}>
                        {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} detected
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            
            <View style={styles.socialLinksNote}>
              <Ionicons name="information-circle" size={16} color="#7f8c8d" />
              <Text style={styles.noteText}>
                Platform icons will automatically appear based on your URL. These links will be displayed on your store profile.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateStore}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Store...' : 'Create Store'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Guest User Styles
  gradientBackground: {
    flex: 1,
  },
  
  guestScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
  },
  
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  guestHeader: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  guestLogo: {
    width: 80,
    height: 80,
  },
  
  guestTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  guestSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  
  benefitsContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  
  benefitsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  
  benefitText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    marginLeft: Spacing.lg,
    flex: 1,
    fontWeight: Typography.fontWeight.medium,
  },
  
  ctaContainer: {
    alignItems: 'center',
  },
  
  signupButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    minWidth: 200,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  
  signupButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
  },
  
  backButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  
  backButtonText: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  
  // Regular Form Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#ecf0f1',
  },
  locationButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationButtonTextDisabled: {
    color: '#95a5a6',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  // Category Selection Styles
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#3498db',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  // Image Selection Styles
  imageSection: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  imageContainer: {
    alignItems: 'center',
    width: '100%',
  },
  addImageButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  addCoverImageButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 120,
  },
  addImageText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  selectedImageContainer: {
    position: 'relative',
    width: '100%',
  },
  profileImagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  coverImagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3498db',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#f39c12',
    marginTop: 10,
  },
  coordinateDisplay: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  coordinateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  coordinateSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  
  // Social Links Styles
  socialLinksContainer: {
    marginTop: 10,
  },
  socialLinkItem: {
    marginBottom: 15,
  },
  socialLinkInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingRight: 10,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  socialLinkInput: {
    flex: 1,
    padding: 15,
    fontSize: 14,
    paddingLeft: 0,
  },
  removeLinkButton: {
    padding: 8,
  },
  platformPreview: {
    marginTop: 5,
    paddingLeft: 50,
  },
  platformName: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
  },
  socialLinksNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
    lineHeight: 16,
  },
});
