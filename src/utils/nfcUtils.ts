import NfcManager from 'react-native-nfc-manager';

export const initializeNfc = async (): Promise<boolean> => {
  try {
    // Check if NFC is supported
    const isSupported = await NfcManager.isSupported();
    if (!isSupported) {
      console.log('NFC is not supported on this device');
      return false;
    }

    // Check if NFC is enabled
    const isEnabled = await NfcManager.isEnabled();
    if (!isEnabled) {
      console.log('NFC is disabled. Please enable NFC in device settings.');
      return false;
    }

    // Initialize NFC
    await NfcManager.start();
    console.log('NFC initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing NFC:', error);
    return false;
  }
};

export const cleanupNfc = async (): Promise<void> => {
  try {
    // Cancel any ongoing NFC operations
    await NfcManager.cancelTechnologyRequest();
    console.log('NFC cleanup completed');
  } catch (error) {
    console.error('Error during NFC cleanup:', error);
  }
};
