import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { AuthStackParamList } from '../navigation';
import { colors, spacing } from '../constants/theme';

type PhoneLoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'PhoneLogin'>;

const phoneSchema = yup.object().shape({
  phoneNumber: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(10, 'Phone number must be at least 10 digits'),
});

const otpSchema = yup.object().shape({
  otp: yup.string()
    .required('OTP is required')
    .matches(/^[0-9]+$/, 'OTP must contain only digits')
    .length(6, 'OTP must be 6 digits'),
});

const PhoneLoginScreen = () => {
  const navigation = useNavigation<PhoneLoginScreenNavigationProp>();
  const { requestOtp, verifyOtp, error } = useAuth();
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sentOtp, setSentOtp] = useState(''); // For development only

  const handleRequestOtp = async (values: { phoneNumber: string }) => {
    try {
      setPhoneNumber(values.phoneNumber);
      const otp = await requestOtp(values.phoneNumber);
      
      // In development, we get the OTP in the response
      if (otp) {
        setSentOtp(otp);
      }
      
      setOtpSent(true);
    } catch (error) {
      console.log('OTP request failed:', error);
    }
  };

  const handleVerifyOtp = async (values: { otp: string }) => {
    try {
      await verifyOtp(phoneNumber, values.otp);
      // If successful, the auth context will update and navigate to the main app
    } catch (error) {
      console.log('OTP verification failed:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Login to ScamBane</Text>
          <Text style={styles.subtitle}>
            {otpSent 
              ? 'Enter the verification code sent to your phone'
              : 'Enter your phone number to quickly login or create an account'
            }
          </Text>
        </View>

        {!otpSent ? (
          <Formik
            initialValues={{ phoneNumber: '' }}
            validationSchema={phoneSchema}
            onSubmit={handleRequestOtp}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.formContainer}>
                <TextInput
                  label="Phone Number"
                  value={values.phoneNumber}
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  error={touched.phoneNumber && !!errors.phoneNumber}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                  left={<TextInput.Affix text="+1" />}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <HelperText type="error">{errors.phoneNumber}</HelperText>
                )}

                {error && <HelperText type="error">{error}</HelperText>}

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  style={styles.button}
                  labelStyle={styles.buttonText}
                  icon="phone"
                >
                  Send Verification Code
                </Button>
              </View>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ otp: sentOtp }} // Pre-filled in dev mode for convenience
            validationSchema={otpSchema}
            onSubmit={handleVerifyOtp}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.formContainer}>
                <TextInput
                  label="Verification Code"
                  value={values.otp}
                  onChangeText={handleChange('otp')}
                  onBlur={handleBlur('otp')}
                  error={touched.otp && !!errors.otp}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {touched.otp && errors.otp && (
                  <HelperText type="error">{errors.otp}</HelperText>
                )}

                {error && <HelperText type="error">{error}</HelperText>}

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  style={styles.button}
                  labelStyle={styles.buttonText}
                  icon="check"
                >
                  Verify Code
                </Button>

                <Button
                  mode="text"
                  onPress={() => setOtpSent(false)}
                  style={styles.textButton}
                >
                  Try Different Number
                </Button>
              </View>
            )}
          </Formik>
        )}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Have a password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login with Password</Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
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
  textButton: {
    marginTop: spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    color: colors.textLight,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default PhoneLoginScreen;