import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

class ReminderService {
  constructor() {
    this.messaging = getMessaging();
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }

  async saveReminder(userId, eventId, reminderData) {
    try {
      const reminderRef = await addDoc(collection(db, 'reminders'), {
        userId,
        eventId,
        ...reminderData,
        createdAt: new Date()
      });
      return reminderRef.id;
    } catch (error) {
      console.error('Error saving reminder:', error);
      throw error;
    }
  }

  async getReminders(userId) {
    try {
      const q = query(collection(db, 'reminders'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting reminders:', error);
      throw error;
    }
  }

  async deleteReminder(reminderId) {
    try {
      await deleteDoc(doc(db, 'reminders', reminderId));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  async sendEmailReminder(userEmail, eventTitle, eventDate) {
    // This would integrate with your email service (e.g., SendGrid, AWS SES)
    // For now, we'll just log it
    console.log(`Sending email reminder to ${userEmail} for ${eventTitle} on ${eventDate}`);
  }

  async sendPushNotification(userToken, eventTitle, eventDate) {
    // This would integrate with Firebase Cloud Messaging
    // For now, we'll just log it
    console.log(`Sending push notification to ${userToken} for ${eventTitle} on ${eventDate}`);
  }

  async sendSMSReminder(phoneNumber, eventTitle, eventDate) {
    // This would integrate with your SMS service (e.g., Twilio)
    // For now, we'll just log it
    console.log(`Sending SMS to ${phoneNumber} for ${eventTitle} on ${eventDate}`);
  }
}

export const reminderService = new ReminderService(); 