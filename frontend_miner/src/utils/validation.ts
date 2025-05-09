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