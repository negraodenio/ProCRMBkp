import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string) {
  if (!phone) return "";

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Brazil with Country Code (55 + 2 digits DDD + 8 or 9 digits)
  if (cleaned.startsWith("55") && (cleaned.length === 12 || cleaned.length === 13)) {
    const ddd = cleaned.substring(2, 4);
    if (cleaned.length === 13) {
      return `+55 (${ddd}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    }
    return `+55 (${ddd}) ${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
  }

  // Brazil without Country Code (2 digits DDD + 8 or 9 digits)
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }

  // Portugal with Country Code (351 + 9 digits)
  if (cleaned.startsWith("351") && cleaned.length === 12) {
    return `+351 ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
  }

  // Portugal without Country Code (9 digits)
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }

  // If it doesn't match standard formats but is just numbers,
  // try to see if it's a long ID or similar and return as is
  return phone;
}
