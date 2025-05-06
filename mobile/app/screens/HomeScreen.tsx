import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Card, Text, Button, Avatar, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { ScanStackParamList } from '../navigation';
import { colors, spacing } from '../constants/theme';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<ScanStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <View style={styles.appbarContent}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appbarTitle}>ScamBane</Text>
        </View>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.greeting}>
          <Text style={styles.welcomeText}>
            Welcome, {user?.username || 'User'}
          </Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>
              {user?.subscriptionTier === 'premium' ? 'Premium' : 'Free'}
            </Text>
          </View>
        </View>

        <Card style={styles.statsCard}>
          <Card.Content style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.scansUsed || 0}</Text>
              <Text style={styles.statLabel}>Scans Used</Text>
            </View>
            {user?.subscriptionTier !== 'premium' && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{3 - (user?.scansUsed || 0) > 0 ? 3 - (user?.scansUsed || 0) : 0}</Text>
                <Text style={styles.statLabel}>Scans Left</Text>
              </View>
            )}
            {user?.subscriptionTier === 'premium' && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Unlimited</Text>
                <Text style={styles.statLabel}>Scans Available</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Choose a Scan Type</Text>

        <View style={styles.scanGrid}>
          <TouchableOpacity 
            style={styles.scanCard} 
            onPress={() => navigation.navigate('UrlScan')}
          >
            <Avatar.Icon 
              size={60} 
              icon={() => <MaterialCommunityIcons name="link-variant" size={32} color={colors.primary} />} 
              style={styles.scanIcon}
            />
            <Text style={styles.scanTitle}>URL Scan</Text>
            <Text style={styles.scanDescription}>
              Check websites for phishing and malware
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.scanCard} 
            onPress={() => navigation.navigate('FileScan')}
          >
            <Avatar.Icon 
              size={60} 
              icon={() => <MaterialIcons name="file-present" size={32} color={colors.primary} />} 
              style={styles.scanIcon}
            />
            <Text style={styles.scanTitle}>File Scan</Text>
            <Text style={styles.scanDescription}>
              Analyze files for viruses and threats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.scanCard} 
            onPress={() => navigation.navigate('ImageScan')}
          >
            <Avatar.Icon 
              size={60} 
              icon={() => <MaterialIcons name="image" size={32} color={colors.primary} />} 
              style={styles.scanIcon}
            />
            <Text style={styles.scanTitle}>Image Scan</Text>
            <Text style={styles.scanDescription}>
              Detect steganography in images
            </Text>
          </TouchableOpacity>

          {user?.subscriptionTier === 'premium' && (
            <TouchableOpacity style={styles.scanCard}>
              <Avatar.Icon 
                size={60} 
                icon={() => <MaterialCommunityIcons name="android" size={32} color={colors.primary} />} 
                style={styles.scanIcon}
              />
              <Text style={styles.scanTitle}>APK Scan</Text>
              <Text style={styles.scanDescription}>
                Check Android apps for malware
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {user?.subscriptionTier !== 'premium' && (
          <Card style={styles.upgradeCard}>
            <Card.Content>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeDescription}>
                Get unlimited scans, APK analysis, and priority support
              </Text>
              <Button 
                mode="contained" 
                style={styles.upgradeButton} 
                labelStyle={styles.upgradeButtonText}
                icon="crown"
              >
                Upgrade Now
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    elevation: 0,
  },
  appbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: spacing.xs,
  },
  appbarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scrollContainer: {
    padding: spacing.md,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  tierBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  tierText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text,
  },
  scanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  scanCard: {
    width: '48%',
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 2,
  },
  scanIcon: {
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  scanDescription: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  upgradeCard: {
    backgroundColor: colors.light,
    marginBottom: spacing.lg,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  upgradeDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
  },
  upgradeButtonText: {
    fontWeight: 'bold',
  },
});

export default HomeScreen;