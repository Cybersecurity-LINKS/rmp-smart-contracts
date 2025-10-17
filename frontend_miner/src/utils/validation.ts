// Copyright 2025 Fondazione LINKS

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// src/utils/validation.ts

/**
 * Sanitize the input by removing potentially dangerous characters
 */
export const sanitizeInput = (inputString: string): string => {
    return inputString
        .trim()
        .replace(/[<>]/g, '')
        .replace(/[;'"\\]/g, '');
};

/**
 * Check if the name is valid
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
    return inputString.replace(/[^0-9]/g, '');
}

/**
 * Check it is a text with only letters (included ' and -)
 * @param inputString
 */
export function sanitizeOnlyLetters(inputString: string) {
    return inputString.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
}

/**
 * Check it is a text with letters and numbers
 * @param inputString
 */
export function sanitizeOnlyLettersAndNumbers(inputString: string) {
    return inputString.replace(/[^A-Za-z0-9À-ÿ\s]/g, '');
}

/**
 * Sanitize basic text
 * @param inputString
 */
export const sanitizeBasic = (inputString: string): string => {
    return inputString
        .trim()
        // Removes control and non-printable characters
        .replace(/[\p{Cc}\u2028\u2029\uFEFF]/gu, '')
        // Removes potentially dangerous characters
        .replace(/[<>]/g, '');
};

/**
 * Sanitize long text fields
 * @param inputString
 */
export const sanitizeRichText = (inputString: string): string => {
    const sanitized = inputString
        // Allows letters, numbers, common punctuation, and basic symbols
        .replace(/[^\x20-\x7E\xA0-\xFF\s.,!?()[\]{}@#$%^&*+=_-]/g, '')
        // Removes multiple space sequences
        .replace(/\s+/g, ' ');

    return sanitized.slice(0, 500);
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