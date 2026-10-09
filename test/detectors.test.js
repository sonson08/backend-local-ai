import { describe, expect, it } from 'vitest';
import { runDetectors } from '../services/detectors';

const detect = (text) => runDetectors(text).map(({ detector, match }) => ({ detector, match }));

describe('pattern detectors', () => {
  it.each([
    ['email', 'Contact juan.delacruz@example.com today', 'juan.delacruz@example.com'],
    ['email', 'Send to ana+work@mail.example.co.uk.', 'ana+work@mail.example.co.uk'],
    ['ph_mobile', 'Text me at 0917 123 4567 later', '0917 123 4567'],
    ['ph_mobile', 'Tawagan mo ako sa +63 917 123 4567', '+63 917 123 4567'],
    ['ph_mobile', 'cp: 09171234567', '09171234567'],
    ['ph_mobile', 'or +639171234567', '+639171234567'],
    ['ph_landline', 'Office (02) 8123 4567', '(02) 8123 4567'],
    ['ph_landline', 'Office +63 2 8123 4567', '+63 2 8123 4567'],
    ['payment_card', 'Card 4111 1111 1111 1111 exp 12/29', '4111 1111 1111 1111'],
    ['payment_card', 'card 5555-5555-5555-4444', '5555-5555-5555-4444'],
    ['ph_tin', 'TIN 123-456-789-000', '123-456-789-000'],
    ['ph_tin', 'TIN: 123456789', '123456789'],
    ['ph_sss', 'SSS 34-1234567-8', '34-1234567-8'],
    ['ph_sss', 'SSS no. 3412345678', '3412345678'],
    ['ph_philhealth', 'PhilHealth 12-345678901-2', '12-345678901-2'],
    ['ph_umid', 'CRN 0028-1234567-8', '0028-1234567-8'],
  ])('%s finds %j', (detector, text, match) => {
    expect(detect(text)).toContainEqual({ detector, match });
  });

  it.each([
    'Meeting on 2024-01-15 at 10:30',
    'Total is 1,234,567.89 pesos',
    'Order number 1234567890123456',
    'Version 1.2.3 released',
    'ISBN 978-3-16-148410-0',
    'Call extension 12345',
    'Card 4111 1111 1111 1112',
    'Reference 123456789 for your order',
    'email me at name@localhost',
  ])('finds nothing in %j', (text) => {
    expect(detect(text)).toEqual([]);
  });

  it('reports exact spans', () => {
    const text = 'Reply to Maria at maria.santos@example.com';
    const [finding] = runDetectors(text);

    expect(text.slice(finding.start, finding.end)).toBe('maria.santos@example.com');
  });
});
