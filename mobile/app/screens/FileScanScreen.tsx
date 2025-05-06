import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Button, Text, Card, HelperText, Chip, List, Divider, IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../constants/theme';
import * as scanService from '../services/scanService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface ScanResult {
  scanId: number;
  result: 'safe' | 'malicious' | 'suspicious';
  threatType: string | null;
  details: {
    confidence: number;
    detectionTime: string;
    explanation: string;
    fileType: string;
    fileSize: number;
    scanServices: string[];
    isApk?: boolean;
    [key: string]: any;
  };
  scanDetails: Record<string, any>;
  scansUsed: number;
  target: string;
}

const FileScanScreen = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
    size: number;
  } | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'], // Allow all file types
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      if (fileInfo.exists) {
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'application/octet-stream',
          size: fileInfo.size,
        });
        setError(null);
        setScanResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select file');
      console.error('Document picker error:', err);
    }
  };

  const handleScanFile = async () => {
    if (!user || !selectedFile) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const result = await scanService.scanFile(
        selectedFile.uri, 
        selectedFile.name,
        selectedFile.mimeType
      );
      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan file');
      console.error('File scan error:', err);
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

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'file-image';
    if (mimeType === 'application/pdf') return 'file-pdf-box';
    if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') return 'zip-box';
    if (mimeType === 'application/vnd.android.package-archive') return 'android';
    if (mimeType === 'application/x-msdownload' || mimeType === 'application/x-msi') return 'microsoft-windows';
    return 'file-document';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>File Scan</Text>
        <Text style={styles.subtitle}>
          Check if a file contains malware or viruses
        </Text>
      </View>

      <Card style={styles.uploadCard}>
        <Card.Content>
          <TouchableOpacity 
            style={styles.uploadArea} 
            onPress={pickDocument}
            disabled={isScanning}
          >
            {selectedFile ? (
              <View style={styles.selectedFileContainer}>
                <MaterialCommunityIcons 
                  name={getFileTypeIcon(selectedFile.mimeType)} 
                  size={40} 
                  color={colors.primary} 
                />
                <View style={styles.fileInfoContainer}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => setSelectedFile(null)}
                  disabled={isScanning}
                />
              </View>
            ) : (
              <>
                <MaterialCommunityIcons 
                  name="file-upload-outline" 
                  size={48} 
                  color={colors.primary} 
                />
                <Text style={styles.uploadText}>
                  Tap to select a file to scan
                </Text>
                <Text style={styles.uploadSubtext}>
                  PDF, ZIP, EXE, APK, and other file types supported
                </Text>
              </>
            )}
          </TouchableOpacity>

          {error && <HelperText type="error">{error}</HelperText>}

          <Button
            mode="contained"
            onPress={handleScanFile}
            style={styles.button}
            labelStyle={styles.buttonText}
            icon="shield-search"
            loading={isScanning}
            disabled={isScanning || !selectedFile || (user?.subscriptionTier !== 'premium' && (user?.scansUsed || 0) >= 3)}
          >
            {isScanning ? 'Scanning...' : 'Scan File'}
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
          <Text style={styles.loadingText}>Scanning file for threats...</Text>
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
                  File is {scanResult.result.toUpperCase()}
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

            <View style={styles.fileInfoGrid}>
              <View style={styles.fileInfoItem}>
                <Text style={styles.fileInfoLabel}>File Type</Text>
                <Text style={styles.fileInfoValue}>{scanResult.details.fileType}</Text>
              </View>
              <View style={styles.fileInfoItem}>
                <Text style={styles.fileInfoLabel}>Size</Text>
                <Text style={styles.fileInfoValue}>{formatFileSize(scanResult.details.fileSize)}</Text>
              </View>
              {scanResult.details.isApk && (
                <View style={styles.fileInfoItem}>
                  <Text style={styles.fileInfoLabel}>Package Type</Text>
                  <Text style={styles.fileInfoValue}>Android APK</Text>
                </View>
              )}
            </View>

            {scanResult.threatType && (
              <Chip style={styles.threatChip} textStyle={styles.threatChipText}>
                Threat Type: {scanResult.threatType}
              </Chip>
            )}

            <Text style={styles.explanationTitle}>Analysis:</Text>
            <Text style={styles.explanationText}>{scanResult.details.explanation}</Text>

            <Text style={styles.servicesTitle}>Security Services Used:</Text>
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
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  uploadSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  fileInfoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  fileName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.text,
  },
  fileSize: {
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
  fileInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  fileInfoItem: {
    minWidth: '30%',
    marginRight: spacing.md,
    marginBottom: spacing.md,
  },
  fileInfoLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  fileInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
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

export default FileScanScreen;