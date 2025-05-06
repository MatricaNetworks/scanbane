import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Card, HelperText, Chip, List, Divider } from 'react-native-paper';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../constants/theme';
import * as scanService from '../services/scanService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const urlSchema = yup.object().shape({
  url: yup.string()
    .required('URL is required')
    .url('Please enter a valid URL'),
});

interface ScanResult {
  scanId: number;
  result: 'safe' | 'malicious' | 'suspicious';
  threatType: string | null;
  details: {
    confidence: number;
    detectionTime: string;
    explanation: string;
    scanServices: string[];
    [key: string]: any;
  };
  scanDetails: Record<string, any>;
  scansUsed: number;
  target: string;
}

const UrlScanScreen = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanUrl = async (values: { url: string }) => {
    if (!user) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const result = await scanService.scanUrl(values.url);
      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan URL');
      console.error('URL scan error:', err);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>URL Scan</Text>
          <Text style={styles.subtitle}>
            Check if a website is safe or contains threats
          </Text>
        </View>

        <Formik
          initialValues={{ url: '' }}
          validationSchema={urlSchema}
          onSubmit={handleScanUrl}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, resetForm }) => (
            <View style={styles.formContainer}>
              <TextInput
                label="URL to scan"
                value={values.url}
                onChangeText={handleChange('url')}
                onBlur={handleBlur('url')}
                error={touched.url && !!errors.url}
                style={styles.input}
                mode="outlined"
                placeholder="https://example.com"
                autoCapitalize="none"
                keyboardType="url"
                disabled={isScanning}
                left={<TextInput.Icon icon="link-variant" />}
              />
              {touched.url && errors.url && (
                <HelperText type="error">{errors.url}</HelperText>
              )}

              {error && <HelperText type="error">{error}</HelperText>}

              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                style={styles.button}
                labelStyle={styles.buttonText}
                icon="shield-search"
                loading={isScanning}
                disabled={isScanning || (user?.subscriptionTier !== 'premium' && (user?.scansUsed || 0) >= 3)}
              >
                {isScanning ? 'Scanning...' : 'Scan URL'}
              </Button>

              {user?.subscriptionTier !== 'premium' && (
                <Text style={styles.scanLimitText}>
                  {user?.scansUsed || 0}/3 free scans used
                </Text>
              )}
            </View>
          )}
        </Formik>

        {isScanning && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Scanning URL for threats...</Text>
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
                    URL is {scanResult.result.toUpperCase()}
                  </Text>
                  <Text style={styles.resultUrl}>{scanResult.target}</Text>
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
    </KeyboardAvoidingView>
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
  formContainer: {
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.sm,
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
  resultUrl: {
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

export default UrlScanScreen;