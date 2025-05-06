import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Avatar, List, Switch, Divider, Dialog, Portal } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Logout Failed', 'Unable to log out at this time. Please try again.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you'd apply the theme change here
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, you'd update notification settings here
  };

  const toggleBiometric = () => {
    setBiometricEnabled(!biometricEnabled);
    // In a real app, you'd set up biometric auth here
  };

  const getSubscriptionColor = () => {
    switch (user?.subscriptionTier) {
      case 'premium':
        return colors.primary;
      case 'enterprise':
        return colors.secondary;
      default:
        return colors.textLight;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and settings</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={user?.username?.substring(0, 2).toUpperCase() || 'U'}
            style={[styles.avatar, { backgroundColor: getSubscriptionColor() }]}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user?.username}</Text>
            <View style={[styles.subscriptionBadge, { backgroundColor: getSubscriptionColor() + '20' }]}>
              <Text style={[styles.subscriptionText, { color: getSubscriptionColor() }]}>
                {user?.subscriptionTier === 'premium' 
                  ? 'Premium' 
                  : user?.subscriptionTier === 'enterprise'
                  ? 'Enterprise'
                  : 'Free Plan'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.scansUsed || 0}</Text>
            <Text style={styles.statLabel}>Scans Used</Text>
          </View>
          
          {user?.subscriptionTier === 'premium' ? (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Unlimited</Text>
              <Text style={styles.statLabel}>Scans Available</Text>
            </View>
          ) : (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.max(0, 3 - (user?.scansUsed || 0))}</Text>
              <Text style={styles.statLabel}>Free Scans Left</Text>
            </View>
          )}
        </View>

        {user?.phoneNumber && (
          <View style={styles.phoneContainer}>
            <MaterialCommunityIcons name="phone" size={20} color={colors.textLight} />
            <Text style={styles.phoneText}>{user.phoneNumber}</Text>
          </View>
        )}
      </Card>

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

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.settingsTitle}>Settings</Text>

          <List.Item
            title="Dark Mode"
            description="Enable dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={props => <Switch value={darkMode} onValueChange={toggleDarkMode} />}
          />
          <Divider />
          <List.Item
            title="Notifications"
            description="Receive security alerts"
            left={props => <List.Icon {...props} icon="bell-outline" />}
            right={props => <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />}
          />
          <Divider />
          <List.Item
            title="Biometric Authentication"
            description="Use fingerprint or face ID"
            left={props => <List.Icon {...props} icon="fingerprint" />}
            right={props => <Switch value={biometricEnabled} onValueChange={toggleBiometric} />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.settingsTitle}>Account</Text>

          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Subscription Details"
            left={props => <List.Icon {...props} icon="credit-card-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.settingsTitle}>Support</Text>

          <List.Item
            title="Help Center"
            left={props => <List.Icon {...props} icon="help-circle-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Contact Support"
            left={props => <List.Icon {...props} icon="email-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-account-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={() => setLogoutDialogVisible(true)}
        style={styles.logoutButton}
        labelStyle={styles.logoutButtonText}
        icon="logout"
      >
        Logout
      </Button>

      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out of your account?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => {
              setLogoutDialogVisible(false);
              handleLogout();
            }}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingBottom: spacing.xxl,
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
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subscriptionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  subscriptionText: {
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  phoneText: {
    marginLeft: spacing.sm,
    color: colors.textLight,
  },
  upgradeCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.light,
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
  settingsCard: {
    marginBottom: spacing.lg,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.md,
    borderColor: colors.danger,
  },
  logoutButtonText: {
    color: colors.danger,
  },
});

export default ProfileScreen;