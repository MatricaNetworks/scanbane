import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Divider, IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../constants/theme';
import * as scanService from '../services/scanService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

interface ScanResult {
  id: number;
  userId: number;
  scanType: 'url' | 'file' | 'image' | 'apk';
  targetName: string;
  result: 'safe' | 'malicious' | 'suspicious';
  threatType: string | null;
  details: Record<string, any>;
  createdAt: string;
}

const ScanHistoryScreen = () => {
  const { user } = useAuth();
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScanHistory = async () => {
    try {
      setError(null);
      const history = await scanService.getScanHistory(20);
      setScanHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scan history');
      console.error('Scan history error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchScanHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchScanHistory();
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

  const getIconForScanType = (scanType: string) => {
    switch (scanType) {
      case 'url':
        return 'link-variant';
      case 'file':
        return 'file-document-outline';
      case 'image':
        return 'image-outline';
      case 'apk':
        return 'android';
      default:
        return 'shield-search';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderScanItem = ({ item }: { item: ScanResult }) => (
    <Card style={styles.scanCard}>
      <Card.Content>
        <View style={styles.scanHeader}>
          <View style={styles.scanTypeContainer}>
            <MaterialCommunityIcons 
              name={getIconForScanType(item.scanType)} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.scanType}>{item.scanType.toUpperCase()} Scan</Text>
          </View>
          <Chip
            style={[
              styles.resultChip,
              { backgroundColor: getResultColor(item.result) + '20' },
            ]}
            textStyle={{
              color: getResultColor(item.result),
              fontWeight: 'bold',
            }}
          >
            {item.result.toUpperCase()}
          </Chip>
        </View>

        <Text style={styles.scanTarget} numberOfLines={1}>
          {item.targetName}
        </Text>

        <Divider style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Confidence:</Text>
            <Text style={styles.detailValue}>{item.details.confidence}%</Text>
          </View>

          {item.threatType && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Threat Type:</Text>
              <Text style={[styles.detailValue, { color: colors.danger }]}>
                {item.threatType}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.explanationText} numberOfLines={2}>
          {item.details.explanation}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Scan History</Text>
        <Text style={styles.subtitle}>View your recent security scans</Text>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading scan history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchScanHistory}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : scanHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="history" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No Scan History</Text>
          <Text style={styles.emptyText}>
            Your scan history will appear here after you complete your first scan.
          </Text>
        </View>
      ) : (
        <FlatList
          data={scanHistory}
          renderItem={renderScanItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textLight,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    marginTop: spacing.md,
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  listContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  scanCard: {
    marginBottom: spacing.md,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scanTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanType: {
    marginLeft: spacing.xs,
    fontWeight: 'bold',
    color: colors.primary,
  },
  resultChip: {
    height: 28,
  },
  scanTarget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  detailsContainer: {
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    width: 100,
    color: colors.textLight,
    fontSize: 14,
  },
  detailValue: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  explanationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});

export default ScanHistoryScreen;