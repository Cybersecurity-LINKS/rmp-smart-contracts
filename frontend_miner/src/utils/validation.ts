// src/utils/validation.ts

/**
 * Sanitizza l'input rimuovendo caratteri potenzialmente pericolosi
 */
export const sanitizeInput = (input: string): string => {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .replace(/[;'"\\]/g, '');
};

/**
 * Verifica se il nome è valido
 */
export const isValidName = (name: string): boolean => {
    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]{2,50}$/;
    return nameRegex.test(name);
};

/**
 * Check it is a valid number
 * @param inputString
 */
export function sanitizeQuantity(inputString: string) {
    // Remove non-numeric characters except comma
    const numericString = inputString.replace(/[^0-9,.]/g, '');

    // Replace commas with periods
    let sanitizedString = numericString.replace(/,/g, '.');

    // Remove multiple points
    if (sanitizedString.split('.').length > 2) {
        sanitizedString = sanitizedString.replace(/\.(?=.*\.)/g, '');
    }

    return sanitizedString;
}

/**
 * Check it is a passport id
 * @param inputString
 */
export function sanitizeID(inputString: string) {
    // Remove non-numeric characters except comma
    const numericString = inputString.replace(/[^0-9]/g, '');

    return numericString;
}

/**
 * Check it is a text with only letters (included ' and -)
 * @param inputString
 */
export function sanitizeOnlyLetters(inputString: string) {
    const sanitizedValue = inputString.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
    return sanitizedValue;
}

/**
 * Check it is a text with letters and numbers
 * @param inputString
 */
export function sanitizeOnlyLettersAndNumbers(inputString: string) {
    const sanitizedValue = inputString.replace(/[^A-Za-z0-9À-ÿ\s]/g
        , '');
    return sanitizedValue;
}

export const sanitizeBasic = (input: string): string => {
    return input
        .trim()
        // Rimuove caratteri di controllo e non stampabili
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        // Rimuove caratteri che potrebbero causare problemi nella serializzazione JSON
        .replace(/[\u2028\u2029\uFEFF]/g, '')
        // Rimuove caratteri potenzialmente pericolosi
        .replace(/[<>]/g, '');
};

export const sanitizeRichText = (input: string): string => {
    const sanitized = sanitizeBasic(input)
        // Permette lettere, numeri, punteggiatura comune e simboli base
        .replace(/[^\x20-\x7E\xA0-\xFF\s.,!?()[\]{}@#$%^&*+=_-]/g, '')
        // Rimuove sequenze di spazi multipli
        .replace(/\s+/g, ' ');

    return sanitized.slice(0, 500); // Limita la lunghezza
};



/**
 * Checks if a passport ID is valid (contains only digits).
 * @param passportID The passport ID string to validate.
 * @returns True if the passport ID is valid, false otherwise.
 */
export const isValidPassportID = (passportID: string): boolean => {
    if (passportID === null || passportID === undefined || passportID.trim() === "") {
        return false;
    }
    const passportIDRegex = /^[0-9]+$/;
    return passportIDRegex.test(passportID);
};