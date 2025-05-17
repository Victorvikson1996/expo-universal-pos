import NfcManager, { NfcTech, TagEvent } from 'react-native-nfc-manager';
import type { CardData } from '@/utils/types';
import { initializeNfc, cleanupNfc } from '@/utils/nfcUtils';

// Helper: Convert hex string to byte array
const hexToBytes = (hex: string): number[] => {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
};

// Helper: Convert byte array to hex string
const bytesToHex = (bytes: number[]): string => {
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

// Simple TLV parser for EMV data
const parseTLV = (data: string): { [key: string]: string } => {
  const result: { [key: string]: string } = {};
  let i = 0;

  while (i < data.length) {
    let tag = data.substr(i, 2);
    i += 2;
    if ((parseInt(tag, 16) & 0x1f) === 0x1f) {
      tag += data.substr(i, 2);
      i += 2;
    }

    let length = parseInt(data.substr(i, 2), 16);
    i += 2;
    if (length > 127) {
      const lenBytes = length & 0x7f;
      length = parseInt(data.substr(i, lenBytes * 2), 16);
      i += lenBytes * 2;
    }

    const value = data.substr(i, length * 2);
    i += length * 2;

    result[tag] = value;
  }

  return result;
};

class CardUtils {
  // Card type detection based on BIN
  getCardType(cardNumber: string): string {
    const cleanCardNumber = cardNumber.replace(/[\s-]/g, '');
    if (/^4/.test(cleanCardNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanCardNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanCardNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanCardNumber)) return 'Discover';
    if (/^35(?:2[89]|[3-8])/.test(cleanCardNumber)) return 'JCB';
    if (/^30[0-5]/.test(cleanCardNumber)) return 'Diners Club';
    if (/^3095/.test(cleanCardNumber)) return 'Diners Club';
    if (/^36/.test(cleanCardNumber)) return 'Diners Club';
    if (/^3[89]/.test(cleanCardNumber)) return 'Diners Club';
    if (/^62/.test(cleanCardNumber)) return 'UnionPay';
    return 'Unknown';
  }

  // Validate card number using Luhn algorithm
  validateCardNumber(cardNumber: string): boolean {
    const cleanCardNumber = cardNumber.replace(/[\s-]/g, '');
    if (!/^\d+$/.test(cleanCardNumber)) return false;

    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(cleanCardNumber.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  // Validate expiry date
  validateExpiryDate(expiryDate: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiryDate)) return false;

    const [month, year] = expiryDate.split('/');
    const expMonth = Number.parseInt(month);
    const expYear = Number.parseInt('20' + year);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (
      expYear < currentYear ||
      (expYear === currentYear && expMonth < currentMonth)
    ) {
      return false;
    }
    return true;
  }

  // Format card number with spaces
  formatCardNumber(cardNumber: string): string {
    const cleanCardNumber = cardNumber.replace(/[\s-]/g, '');
    const cardType = this.getCardType(cleanCardNumber);

    if (cardType === 'American Express') {
      return cleanCardNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else {
      return cleanCardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
  }

  async readCardWithNfc(): Promise<CardData> {
    try {
      // Initialize NFC
      const nfcInitialized = await initializeNfc();
      if (!nfcInitialized) {
        throw new Error('NFC initialization failed');
      }

      // Request ISO-DEP technology
      await NfcManager.requestTechnology(NfcTech.IsoDep);

      // Get the tag
      const tag: TagEvent = await NfcManager.getTag();
      if (!tag) {
        throw new Error('No NFC tag detected. Please tap a card or device.');
      }

      // Select PPSE
      const PPSE_AID = '325041592E5359532E4444463031'; // 2PAY.SYS.DDF01
      const selectPPSE = `00A40400${(PPSE_AID.length / 2)
        .toString(16)
        .padStart(2, '0')}${PPSE_AID}`;
      const ppseResponse = await NfcManager.isoDepHandler.transceive(
        hexToBytes(selectPPSE)
      );
      const ppseResponseHex = bytesToHex(ppseResponse);

      if (!ppseResponseHex.endsWith('9000')) {
        throw new Error(
          'Failed to select PPSE. Ensure the card or device supports contactless payments.'
        );
      }

      // Parse PPSE response for AID
      const tlvData = parseTLV(ppseResponseHex);
      const aidTag = '4F';
      let cardAID: string | null = null;

      for (const tag in tlvData) {
        if (tag === aidTag) {
          cardAID = tlvData[tag];
          break;
        }
      }

      if (!cardAID) {
        throw new Error('No supported payment application found.');
      }

      // Map AID to card type
      const knownAIDs: { [key: string]: string } = {
        A000000003: 'Visa',
        A000000004: 'Mastercard',
        A000000025: 'American Express',
        A000000065: 'JCB',
        A000000152: 'Discover',
        A000000324: 'UnionPay'
      };
      const cardType = knownAIDs[cardAID.substr(0, 10)] || 'Unknown';

      // Select payment application
      const selectAID = `00A40400${(cardAID.length / 2)
        .toString(16)
        .padStart(2, '0')}${cardAID}`;
      const aidResponse = await NfcManager.isoDepHandler.transceive(
        hexToBytes(selectAID)
      );
      const aidResponseHex = bytesToHex(aidResponse);
      if (!aidResponseHex.endsWith('9000')) {
        throw new Error('Failed to select payment application.');
      }

      // Get Processing Options
      const getProcessingOptions = '80A80000028300';
      const gpoResponse = await NfcManager.isoDepHandler.transceive(
        hexToBytes(getProcessingOptions)
      );
      const gpoResponseHex = bytesToHex(gpoResponse);
      if (!gpoResponseHex.endsWith('9000')) {
        throw new Error('Failed to get processing options.');
      }

      // Parse card data
      let cardNumber = '';
      let expiryDate = '';
      const gpoTLV = parseTLV(gpoResponseHex);

      // Check AFL for records
      const aflTag = '94';
      if (gpoTLV[aflTag]) {
        const afl = gpoTLV[aflTag];
        for (let i = 0; i < afl.length; i += 8) {
          const sfi = parseInt(afl.substr(i, 2), 16) >> 3;
          const startRecord = parseInt(afl.substr(i + 2, 2), 16);
          const endRecord = parseInt(afl.substr(i + 4, 2), 16);

          for (let rec = startRecord; rec <= endRecord; rec++) {
            const readRecord = `00B200${(sfi << 3)
              .toString(16)
              .padStart(2, '0')}${rec.toString(16).padStart(2, '0')}00`;
            const recordResponse = await NfcManager.isoDepHandler.transceive(
              hexToBytes(readRecord)
            );
            const recordResponseHex = bytesToHex(recordResponse);
            if (!recordResponseHex.endsWith('9000')) {
              continue;
            }

            const recordTLV = parseTLV(recordResponseHex);
            if (recordTLV['5A']) {
              cardNumber = recordTLV['5A'].replace(/F+$/, '');
            }
            if (recordTLV['5F24']) {
              const expiry = recordTLV['5F24'];
              expiryDate = `${expiry.substr(2, 2)}/${expiry.substr(0, 2)}`;
            }
          }
        }
      }

      // Fallback: Get Data
      if (!cardNumber) {
        const getPAN = '80CA5A00';
        const panResponse = await NfcManager.isoDepHandler.transceive(
          hexToBytes(getPAN)
        );
        const panResponseHex = bytesToHex(panResponse);
        if (panResponseHex.endsWith('9000')) {
          const panTLV = parseTLV(panResponseHex);
          if (panTLV['5A']) {
            cardNumber = panTLV['5A'].replace(/F+$/, '');
          }
        }
      }
      if (!expiryDate) {
        const getExpiry = '80CA5F2400';
        const expiryResponse = await NfcManager.isoDepHandler.transceive(
          hexToBytes(getExpiry)
        );
        const expiryResponseHex = bytesToHex(expiryResponse);
        if (expiryResponseHex.endsWith('9000')) {
          const expiryTLV = parseTLV(expiryResponseHex);
          if (expiryTLV['5F24']) {
            const expiry = expiryTLV['5F24'];
            expiryDate = `${expiry.substr(2, 2)}/${expiry.substr(0, 2)}`;
          }
        }
      }

      // Validate data
      if (!cardNumber || !this.validateCardNumber(cardNumber)) {
        throw new Error('Invalid card number.');
      }
      if (!expiryDate || !this.validateExpiryDate(expiryDate)) {
        throw new Error('Invalid expiry date.');
      }

      // Construct CardData
      const cardData: CardData = {
        cardType: this.getCardType(cardNumber) || cardType,
        lastFour: cardNumber.slice(-4),
        expiryDate
      };

      return cardData;
    } catch (error) {
      console.error('NFC read error:', error);
      throw new Error(`Failed to read card: ${error.message}`);
    } finally {
      await cleanupNfc();
    }
  }
}

export const cardUtils = new CardUtils();
