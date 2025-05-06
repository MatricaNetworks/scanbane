import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { Button, Text, Card, HelperText, Chip, List, Divider, IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../constants/theme';
import * as scanService from '../services/scanService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface ScanResult {
  scanId: number;
  result: 'safe' | 'malicious' | 'suspicious';
  threatType: string | null;
  details: {
    confidence: number;
    detectionTime: string;
    explanation: string;
    imageType: string;
    imageSize: number;
    hasSteganography: boolean;
    scanServices: string[];
    [key: string]: any;
  };
  scanDetails: Record<string, any>;
  scansUsed: number;
  target: string;
}

const windowWidth = Dimensions.get('window').width;

const ImageScanScreen = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name: string;
    type: string;
    width?: number;
    height?: number;
    size?: number;
  } | null>(null);

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      // Request permissions first
      if (source === 'camera') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          setError('Camera permission is required to take photos');
          return;
        }
      } else {
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPermission.granted) {
          setError('Photo library permission is required to select images');
          return;
        }
      }

      // Launch camera or image picker
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      const fileName = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;

      setSelectedImage({
        uri: asset.uri,
        name: fileName,
        type: 'image/jpeg',
        width: asset.width,
        height: asset.height,
        size: fileInfo.size,
      });
      setError(null);
      setScanResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select image');
      console.error('Image picker error:', err);
    }
  };

  const handleScanImage = async () => {
    if (!user || !selectedImage) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const result = await scanService.scanImage(
        selectedImage.uri, 
        selectedImage.name
      );
      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan image');
      console.error('Image scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'safe':
        return colors.success;
      case 'malicious':
        return colors.danger;
      case 'suspicious':
        return colors.warning;
      default:
        return colors.textLight;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Image Scan</Text>
        <Text style={styles.subtitle}>
          Detect steganography and hidden data in images
        </Text>
      </View>

      <Card style={styles.uploadCard}>
        <Card.Content>
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image 
                source={{ uri: selectedImage.uri }} 
                style={styles.selectedImage} 
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <IconButton
                  icon="close"
                  iconColor="white"
                  size={24}
                  style={styles.removeButton}
                  onPress={() => setSelectedImage(null)}
                  disabled={isScanning}
                />
              </View>
              <View style={styles.imageInfoContainer}>
                <Text style={styles.imageName} numberOfLines={1}>
                  {selectedImage.name}
                </Text>
                <Text style={styles.imageSize}>
                  {selectedImage.width}x{selectedImage.height}px
                  {selectedImage.size ? ` • ${formatFileSize(selectedImage.size)}` : ''}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity 
                style={[styles.pickerButton, styles.cameraButton]} 
                onPress={() => pickImage('camera')}
                disabled={isScanning}
              >
                <MaterialCommunityIcons name="camera" size={36} color={colors.primary} />
                <Text style={styles.pickerButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.pickerButton, styles.galleryButton]} 
                onPress={() => pickImage('library')}
                disabled={isScanning}
              >
                <MaterialCommunityIcons name="image-multiple" size={36} color={colors.secondary} />
                <Text style={styles.pickerButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && <HelperText type="error">{error}</HelperText>}

          <Button
            mode="contained"
            onPress={handleScanImage}
            style={styles.button}
            labelStyle={styles.buttonText}
            icon="shield-search"
            loading={isScanning}
            disabled={isScanning || !selectedImage || (user?.subscriptionTier !== 'premium' && (user?.scansUsed || 0) >= 3)}
          >
            {isScanning ? 'Scanning...' : 'Scan Image'}
          </Button>

          {user?.subscriptionTier !== 'premium' && (
            <Text style={styles.scanLimitText}>
              {user?.scansUsed || 0}/3 free scans used
            </Text>
          )}
        </Card.Content>
      </Card>

      {isScanning && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Scanning image for hidden data and threats...
          </Text>
        </View>
      )}

      {scanResult && !isScanning && (
        <Card style={styles.resultCard}>
          <Card.Content>
            <View style={styles.resultHeader}>
              <MaterialCommunityIcons
                name={
                  scanResult.result === 'safe'
                    ? 'shield-check'
                    : scanResult.result === 'malicious'
                    ? 'shield-alert'
                    : 'shield-half-full'
                }
                size={40}
                color={getResultColor(scanResult.result)}
              />
              <View style={styles.resultHeaderText}>
                <Text style={styles.resultTitle}>
                  Image is {scanResult.result.toUpperCase()}
                </Text>
                <Text style={styles.resultFileName}>{scanResult.target}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence:</Text>
              <Text style={styles.confidenceValue}>{scanResult.details.confidence}%</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${scanResult.details.confidence}%`,
                      backgroundColor: getResultColor(scanResult.result),
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.imageInfoGrid}>
              <View style={styles.imageInfoItem}>
                <Text style={styles.imageInfoLabel}>Image Type</Text>
                <Text style={styles.imageInfoValue}>{scanResult.details.imageType}</Text>
              </View>
              <View style={styles.imageInfoItem}>
                <Text style={styles.imageInfoLabel}>Size</Text>
                <Text style={styles.imageInfoValue}>{formatFileSize(scanResult.details.imageSize)}</Text>
              </View>
              <View style={styles.imageInfoItem}>
                <Text style={styles.imageInfoLabel}>Steganography</Text>
                <Chip 
                  style={[
                    styles.stegoChip, 
                    {backgroundColor: scanResult.details.hasSteganography ? colors.danger + '20' : colors.success + '20'}
                  ]} 
                  textStyle={{
                    color: scanResult.details.hasSteganography ? colors.danger : colors.success,
                    fontWeight: 'bold',
                  }}
                >
                  {scanResult.details.hasSteganography ? 'Detected' : 'Not Detected'}
                </Chip>
              </View>
            </View>

            {scanResult.threatType && (
              <Chip style={styles.threatChip} textStyle={styles.threatChipText}>
                Threat Type: {scanResult.threatType}
              </Chip>
            )}

            <Text style={styles.explanationTitle}>Analysis:</Text>
            <Text style={styles.explanationText}>{scanResult.details.explanation}</Text>

            <Text style={styles.servicesTitle}>Detection Methods Used:</Text>
            <View style={styles.servicesList}>
              {scanResult.details.scanServices.map((service, index) => (
                <Chip key={index} style={styles.serviceChip}>
                  {service}
                </Chip>
              ))}
            </View>

            <List.Accordion
              title="Detailed Scan Results"
              titleStyle={styles.accordionTitle}
              style={styles.accordion}
            >
              {Object.entries(scanResult.scanDetails).map(([key, value]) => {
                if (value === null || value === undefined) return null;
                return (
                  <List.Item
                    key={key}
                    title={key}
                    description={typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                    descriptionNumberOfLines={3}
                    titleStyle={styles.accordionItemTitle}
                    descriptionStyle={styles.accordionItemDescription}
                  />
                );
              })}
            </List.Accordion>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: spacing.lg,
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  uploadCard: {
    marginBottom: spacing.xl,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pickerButton: {
    width: '48%',
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cameraButton: {
    backgroundColor: colors.primary + '10',
  },
  galleryButton: {
    backgroundColor: colors.secondary + '10',
  },
  pickerButtonText: {
    marginTop: spacing.sm,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedImageContainer: {
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: windowWidth * 0.6,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    margin: spacing.xs,
  },
  removeButton: {
    margin: 0,
  },
  imageInfoContainer: {
    padding: spacing.sm,
    backgroundColor: colors.light,
  },
  imageName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.text,
  },
  imageSize: {
    fontSize: 14,
    color: colors.textLight,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanLimitText: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textLight,
    fontSize: 16,
    textAlign: 'center',
  },
  resultCard: {
    marginBottom: spacing.xl,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultHeaderText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultFileName: {
    fontSize: 14,
    color: colors.textLight,
  },
  divider: {
    marginVertical: spacing.md,
  },
  confidenceContainer: {
    marginBottom: spacing.md,
  },
  confidenceLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
  },
  imageInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  imageInfoItem: {
    minWidth: '30%',
    marginRight: spacing.md,
    marginBottom: spacing.md,
  },
  imageInfoLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  imageInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stegoChip: {
    marginTop: spacing.xs,
  },
  threatChip: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: colors.light,
  },
  threatChipText: {
    color: colors.danger,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  explanationText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  serviceChip: {
    margin: spacing.xs,
    backgroundColor: colors.light,
  },
  accordion: {
    backgroundColor: colors.light,
    marginTop: spacing.md,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accordionItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  accordionItemDescription: {
    fontSize: 12,
  },
});

export default ImageScanScreen;