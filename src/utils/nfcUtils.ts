import NfcManager from 'react-native-nfc-manager';

export const initializeNfc = async () => {
  try {
    // Check if NFC is supported
    const isSupported = await NfcManager.isSupported();

    if (isSupported) {
      // Initialize NFC
      await NfcManager.start();
      console.log('NFC initialized successfully');
      return true;
    } else {
      console.log('NFC is not supported on this device');
      return false;
    }
  } catch (error) {
    console.error('Error initializing NFC:', error);
    return false;
  }
};

export const cleanupNfc = () => {
  // Cancel any ongoing NFC operations and clean up
  NfcManager.cancelTechnologyRequest().catch(() => {});
};
