import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { PriceCard } from '@/components/PriceCard';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/context/AuthContext';
import {
  getCurrentPrices,
  createTransaction,
} from '@/services/firestoreService';
import { requestNotificationPermissions } from '@/services/notificationService';
import { Price } from '@/types';
import { TrendingUp, Coins } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const [prices, setPrices] = useState<Price | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [gramsToBuy, setGramsToBuy] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrices();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    await requestNotificationPermissions();

    // Listen for notifications while app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body } = notification.request.content;
        if (title?.includes('Price Update')) {
          Alert.alert(title, body);
          fetchPrices(); // Refresh prices when notification received
        }
      }
    );

    return () => subscription.remove();
  };

  const fetchPrices = async () => {
    try {
      const currentPrices = await getCurrentPrices();
      setPrices(currentPrices);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const handleBuyGold = async () => {
    if (!gramsToBuy || isNaN(parseFloat(gramsToBuy))) {
      Alert.alert('Error', 'Please enter a valid amount of grams');
      return;
    }

    if (!prices || !user) {
      Alert.alert('Error', 'Unable to process transaction');
      return;
    }

    const grams = parseFloat(gramsToBuy);
    const totalAmount = grams * prices.goldPrice;

    Alert.alert(
      'Confirm Purchase',
      `Purchase ${grams}g of gold for ₹${totalAmount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: processPurchase },
      ]
    );
  };

  const processPurchase = async () => {
    if (!user || !prices) return;

    setLoading(true);
    try {
      const grams = parseFloat(gramsToBuy);
      await createTransaction(
        user.id,
        user.bookid,
        user.name,
        grams,
        prices.goldPrice
      );

      Alert.alert('Success', 'Gold purchased successfully!');
      setModalVisible(false);
      setGramsToBuy('');
    } catch (error) {
      Alert.alert('Error', 'Failed to process transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Coins size={32} color="#FFD700" />
        </View>
      </View>

      <View style={styles.pricesHeader}>
        <TrendingUp size={20} color="#FFD700" />
        <Text style={styles.pricesTitle}>Today's Market Prices</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pricesContainer}
      >
        {prices ? (
          <>
            <PriceCard
              title="Gold"
              price={prices.goldPrice}
              unit="gram"
              icon="🥇"
            />
            <PriceCard
              title="Silver"
              price={prices.silverPrice}
              unit="gram"
              icon="🥈"
            />
          </>
        ) : (
          <Text style={styles.loadingText}>Loading prices...</Text>
        )}
      </ScrollView>

      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.totalGrams.toFixed(2)}g</Text>
          <Text style={styles.statLabel}>Gold Owned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.monthsPaid}/11</Text>
          <Text style={styles.statLabel}>Months Paid</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ₹{user?.totalAmountSpent.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.buyButton, !prices && styles.buyButtonDisabled]}
        onPress={() => setModalVisible(true)}
        disabled={!prices}
      >
        <View style={styles.buyButtonContent}>
          <Coins size={24} color="#1a1a1a" />
          <Text style={styles.buyButtonText}>Purchase Gold</Text>
        </View>
        <Text style={styles.buyButtonSubtext}>Invest in your future</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buy Gold</Text>
            <Text style={styles.modalSubtitle}>
              Current price: ₹{prices?.goldPrice.toFixed(2)} per gram
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter grams to buy"
              placeholderTextColor="#888"
              value={gramsToBuy}
              onChangeText={setGramsToBuy}
              keyboardType="numeric"
            />

            {gramsToBuy && prices && (
              <Text style={styles.totalAmount}>
                Total: ₹{(parseFloat(gramsToBuy) * prices.goldPrice).toFixed(2)}
              </Text>
            )}

            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="secondary"
              />
              <View style={styles.buttonSpacer} />
              <CustomButton
                title="Buy"
                onPress={handleBuyGold}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcome: {
    color: '#888',
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerIcon: {
    backgroundColor: '#2d2d2d',
    borderRadius: 20,
    padding: 12,
  },
  pricesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pricesTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  pricesContainer: {
    marginBottom: 32,
  },
  quickStats: {
    backgroundColor: '#2d2d2d',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#444',
    marginHorizontal: 16,
  },
  buyButton: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  buyButtonDisabled: {
    backgroundColor: '#444',
    opacity: 0.5,
  },
  buyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  buyButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buyButtonSubtext: {
    color: '#1a1a1a',
    fontSize: 14,
    opacity: 0.7,
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  actionContainer: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  totalAmount: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  buttonSpacer: {
    width: 12,
  },
});
