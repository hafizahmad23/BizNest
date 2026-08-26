// ============================================================================
// BizNest Pakistan — Input validation & sanitization helpers
// Used by all forms before anything touches the database.
// ============================================================================

/** Strip control characters, collapse whitespace, trim. Defense-in-depth
 * alongside Supabase's parameterized queries. */
export function sanitizeText(input: string, maxLength = 2000): string {
  if (!input) return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/** Multiline-safe variant (keeps line breaks) */
export function sanitizeMultiline(input: string, maxLength = 5000): string {
  if (!input) return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Pakistani phone: +923XXXXXXXXX, 923XXXXXXXXX or 03XXXXXXXXX */
export function isValidPakistanPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-()]/g, '');
  return /^(\+92|92|0)3\d{9}$/.test(clean);
}

/** Full name used at signup and in Account Settings. */
export function validateFullName(name: string): string | null {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 3) return 'Full name must be at least 3 characters.';
  if (trimmed.length > 60) return 'Full name must be 60 characters or fewer.';
  return null;
}

/**
 * WhatsApp / customer-contact number: optional.
 * Digits only (spaces/dashes allowed), optional +92 / 92 / 0 prefix.
 */
export function isValidWhatsAppNumber(value: string): boolean {
  if (!value || !value.trim()) return true;
  const clean = value.replace(/[\s\-()]/g, '');
  if (!/^(\+92|92|0)?\d{10,12}$/.test(clean)) return false;
  const digits = clean.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export function isValidUrl(url: string): boolean {
  if (!url) return true; // optional fields
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Normalize a Pakistani phone to +92XXXXXXXXXX format. */
export function normalizePakistanPhone(phone: string): string {
  const clean = (phone || '').replace(/[^\d+]/g, '');
  if (clean.startsWith('+92')) return clean;
  if (clean.startsWith('92')) return `+${clean}`;
  if (clean.startsWith('03')) return `+92${clean.slice(1)}`;
  return clean;
}

export interface FieldErrors {
  [field: string]: string;
}

/** Validate the create-business payload. Returns {} when valid. */
export function validateBusinessInput(input: {
  name: string;
  category: string;
  province?: string;
  district?: string;
  city: string;
  phone: string;
  email: string;
  description: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'Business name is required (minimum 2 characters).';
  } else if (input.name.trim().length > 100) {
    errors.name = 'Business name must be under 100 characters.';
  }

  if (!input.category) {
    errors.category = 'Please select a category.';
  }

  if (!input.province) {
    errors.province = 'Please select a province.';
  }

  if (!input.district) {
    errors.district = 'Please select a district.';
  }

  if (!input.city) {
    errors.city = 'Please select a city.';
  }

  if (!input.phone) {
    errors.phone = 'Phone number is required.';
  } else if (!isValidPakistanPhone(input.phone)) {
    errors.phone = 'Enter a valid Pakistani number (e.g. 03001234567 or +923001234567).';
  }

  if (!input.email) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!input.description || input.description.trim().length < 50) {
    errors.description = 'Description is required (minimum 50 characters).';
  }

  return errors;
}

/** Validate a review. Returns {} when valid. */
export function validateReviewInput(input: { rating: number; comment: string }): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.rating || input.rating < 1 || input.rating > 5) {
    errors.rating = 'Please select a rating between 1 and 5 stars.';
  }

  if (input.comment && input.comment.trim().length > 0 && input.comment.trim().length < 10) {
    errors.comment = 'Comment must be at least 10 characters long (or leave it empty).';
  }

  return errors;
}

/** Validate a lead inquiry. Returns {} when valid. */
export function validateLeadInput(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.name || !input.name.trim()) {
    errors.name = 'Your name is required.';
  }

  if (!input.message || input.message.trim().length < 10) {
    errors.message = 'Message is required (minimum 10 characters).';
  }

  const hasEmail = Boolean(input.email && input.email.trim());
  const hasPhone = Boolean(input.phone && input.phone.trim());

  if (!hasEmail && !hasPhone) {
    errors.contact = 'Please provide at least an email address or a phone number.';
  } else {
    if (hasEmail && !isValidEmail(input.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (hasPhone && !isValidPakistanPhone(input.phone)) {
      errors.phone = 'Enter a valid Pakistani phone number.';
    }
  }

  return errors;
}

/** Validate auth credentials. Returns {} when valid. */
export function validateAuthInput(input: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};

  if (!isValidEmail(input.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!input.password || input.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  return errors;
}
