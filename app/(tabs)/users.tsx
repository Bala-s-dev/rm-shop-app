import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, createUser } from '@/services/firestoreService';
import { User } from '@/types';

export default function UsersScreen() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    bookid: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers.filter(u => !u.isAdmin));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.bookid || !newUser.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createUser({
        name: newUser.name,
        bookid: newUser.bookid,
        phone: newUser.phone,
        email: newUser.email,
        isAdmin: false,
      });
      
      Alert.alert('Success', 'User created successfully');
      setModalVisible(false);
      setNewUser({ name: '', bookid: '', phone: '', email: '' });
      await fetchUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Users Management</Text>
        <CustomButton
          title="Add User"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <ScrollView style={styles.usersList}>
        {users.map((user) => (
          <View key={user.id} style={styles.userItem}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userBookId}>Book ID: {user.bookid}</Text>
              <Text style={styles.userStats}>
                {user.monthsPaid}/11 months • {user.totalGrams.toFixed(2)}g gold
              </Text>
            </View>
            <View style={styles.userAmount}>
              <Text style={styles.totalSpent}>₹{user.totalAmountSpent.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New User</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              placeholderTextColor="#888"
              value={newUser.name}
              onChangeText={(text) => setNewUser({...newUser, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Book ID *"
              placeholderTextColor="#888"
              value={newUser.bookid}
              onChangeText={(text) => setNewUser({...newUser, bookid: text})}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              placeholderTextColor="#888"
              value={newUser.phone}
              onChangeText={(text) => setNewUser({...newUser, phone: text})}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor="#888"
              value={newUser.email}
              onChangeText={(text) => setNewUser({...newUser, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="secondary"
              />
              <View style={styles.buttonSpacer} />
              <CustomButton
                title="Create"
                onPress={handleCreateUser}
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
    marginBottom: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  usersList: {
    flex: 1,
  },
  userItem: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userBookId: {
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 4,
  },
  userStats: {
    color: '#888',
    fontSize: 12,
  },
  userAmount: {
    alignItems: 'flex-end',
  },
  totalSpent: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 100,
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
    marginBottom: 24,
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
  modalButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  buttonSpacer: {
    width: 12,
  },
});