import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a phone number for WhatsApp/Evolution API.
 * - Forces '55' prefix for Brazilian numbers if missing.
 * - Truncates correctly for mobile (13 digits) vs fixed (12 digits).
 * - Strips device/JID suffixes.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";

  // FIX: Preserve Linked Identity Device (LID) JIDs
  // LIDs (e.g. 12345...@lid) should NOT be stripped or normalized as phone numbers.
  if (phone.includes("@lid")) {
    return phone;
  }

  // 1. Basic Cleaning
  let cleaned = phone.split("@")[0].split(":")[0].replace(/\D/g, "");

  // 2. Identify and Force BR Country Code (55)
  // ONLY if it has 10 or 11 digits (DDD + Number)
  // This prevents corrupting international numbers (e.g. 351... from Portugal)
  if (!cleaned.startsWith("55")) {
    const len = cleaned.length;
    if (len === 10 || len === 11) {
      const ddd = parseInt(cleaned.substring(0, 2));
      if (ddd >= 11 && ddd <= 99) {
        cleaned = "55" + cleaned;
      }
    }
  }

  // 3. Truncate Brazilian numbers properly
  if (cleaned.startsWith("55")) {
    const len = cleaned.length;

    // Fix: Inspect 12-digit numbers (55 + DDD + 8 digits)
    // If the number starts with 6, 7, 8, or 9, it's a mobile missing the 9th digit.
    // Fixed lines start with 2, 3, 4, 5.
    if (len === 12) {
      const firstDigit = parseInt(cleaned[4]); // Index 4 is the first digit after 55+DDD
      if (firstDigit >= 6) {
        // Insert '9' at index 4
        cleaned = cleaned.substring(0, 4) + "9" + cleaned.substring(4);
      }
    }

    // Mobile numbers have '9' at the 5th position (index 4)
    // After the fix above, mobile numbers should have 13 digits.
    const isMobile = cleaned.length >= 5 && cleaned[4] === '9';

    if (isMobile) {
      // 55 (2) + DDD (2) + 9 + 8 digits = 13
      if (cleaned.length > 13) cleaned = cleaned.substring(0, 13);
    } else {
      // 55 (2) + DDD (2) + 8 digits = 12
      // Fixed lines (start with 2-5)
      if (cleaned.length > 12) cleaned = cleaned.substring(0, 12);
    }
  }

  return cleaned;
}

export function formatPhoneNumber(phone: string) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");

  // Brazil with Country Code (55 + 2 digits DDD + 8 or 9 digits)
  if (cleaned.startsWith("55") && (cleaned.length === 12 || cleaned.length === 13)) {
    const ddd = cleaned.substring(2, 4);
    if (cleaned.length === 13) {
      return `+55 (${ddd}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    }
    return `+55 (${ddd}) ${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
  }

  // Fallbacks
  if (cleaned.length === 11) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  if (cleaned.length === 10) return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;

  return phone;
}
