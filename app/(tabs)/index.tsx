import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { PriceCard } from '@/components/PriceCard';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/context/AuthContext';
import { getCurrentPrices, createTransaction } from '@/services/firestoreService';
import { Price } from '@/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [prices, setPrices] = useState<Price | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [gramsToBuy, setGramsToBuy] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, []);

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
        { text: 'Confirm', onPress: processPurchase }
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
      <Text style={styles.welcome}>Welcome, {user?.name}</Text>
      <Text style={styles.subtitle}>Today's Prices</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pricesContainer}>
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

      <View style={styles.actionContainer}>
        <CustomButton
          title="Buy Gold"
          onPress={() => setModalVisible(true)}
          disabled={!prices}
        />
      </View>

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
  welcome: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 20,
  },
  pricesContainer: {
    marginBottom: 40,
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