import { track } from '@vercel/analytics';

// Countdown Events
export const trackCountdownCreated = (category) => {
  track('countdown_created', { category });
};

export const trackCountdownCompleted = (category) => {
  track('countdown_completed', { category });
};

export const trackCountdownDeleted = (category) => {
  track('countdown_deleted', { category });
};

// Category Events
export const trackCategoryCreated = (categoryName) => {
  track('category_created', { name: categoryName });
};

export const trackCategoryDeleted = (categoryName) => {
  track('category_deleted', { name: categoryName });
};

// View Events
export const trackViewChange = (viewType) => {
  track('view_changed', { type: viewType }); // 'monthly', 'yearly'
};

// Search Events
export const trackSearch = (searchTerm) => {
  track('search_performed', { term: searchTerm });
};

// Reminder Events
export const trackReminderSet = (daysBeforeEvent) => {
  track('reminder_set', { daysBeforeEvent });
};

// Error Events
export const trackError = (errorType, errorMessage) => {
  track('error_occurred', { type: errorType, message: errorMessage });
};

// Feature Usage Events
export const trackFeatureUsage = (featureName, additionalData = {}) => {
  track('feature_used', { feature: featureName, ...additionalData });
}; 