import assert from 'node:assert';
import test, { describe } from 'node:test';
import { EnterpriseDataEngine } from './engine';
import { SAMPLE_PRESETS } from '../data/samples';

describe('EnterpriseDataEngine Unit Tests', () => {
  test('Sample 1 (Yashwanth Formatted Order) extracts all fields correctly', () => {
    const rawText = SAMPLE_PRESETS[0].rawText;
    const data = EnterpriseDataEngine.extract(rawText);

    assert.strictEqual(data.customer_name, 'Yashwanth');
    assert.strictEqual(data.email, 'yash@gmail.com');
    assert.strictEqual(data.phone, '9876543210');
    assert.strictEqual(data.company, 'Samsung');
    assert.strictEqual(data.product, 'Galaxy S25');
    assert.strictEqual(data.order_number, 'ORD12345');
    assert.strictEqual(data.city, 'Hyderabad');
    assert.strictEqual(data.status, 'Delivered');
    assert.strictEqual(data.amount, '65000');
    assert.strictEqual(data.currency, 'INR');
  });

  test('Sample 2 (Alice Natural Invoice) extracts unstructured fields', () => {
    const rawText = SAMPLE_PRESETS[1].rawText;
    const data = EnterpriseDataEngine.extract(rawText);

    assert.strictEqual(data.customer_name, 'Alice');
    assert.strictEqual(data.product, 'Dell Inspiron Laptop');
    assert.strictEqual(data.order_number, 'INV-9021');
    assert.strictEqual(data.amount, '65000');
    assert.strictEqual(data.currency, 'INR');
  });

  test('Sample 3 (Prompt Injection Security Test) treats malicious payloads strictly as text', () => {
    const rawText = SAMPLE_PRESETS[2].rawText;
    const data = EnterpriseDataEngine.extract(rawText);

    assert.strictEqual(data.customer_name, 'John');
    assert.strictEqual(data.email, 'john@gmail.com');
    assert.strictEqual(data.phone, '9999999999');
    assert.strictEqual(data.state, 'California');
    assert.strictEqual(data.country, 'USA');
    // Verify prompt injection phrases did NOT break extraction or set abnormal keys
    assert.strictEqual(data.product, null);
    assert.strictEqual(data.amount, null);
  });

  test('Sample 4 (Support Email) extracts multi-word name, company, and dates', () => {
    const rawText = SAMPLE_PRESETS[3].rawText;
    const data = EnterpriseDataEngine.extract(rawText);

    assert.strictEqual(data.customer_name, 'Sarah Connor');
    assert.strictEqual(data.company, 'Cyberdyne Systems');
    assert.strictEqual(data.product, 'Industrial Servo Motor');
    assert.strictEqual(data.order_number, 'TXN-44912');
    assert.strictEqual(data.phone, '5550192834');
    assert.strictEqual(data.email, 'sarah@cyberdyne.com');
    assert.strictEqual(data.city, 'Los Angeles');
    assert.strictEqual(data.state, 'California');
    assert.strictEqual(data.country, 'USA');
    assert.strictEqual(data.purchase_date, '2026-08-01');
    assert.strictEqual(data.status, 'Processing');
    assert.strictEqual(data.amount, '1250.00');
    assert.strictEqual(data.currency, 'USD');
  });

  test('Multi-field inline line splitting works', () => {
    const rawText = 'City: Chicago, State: Illinois, Country: USA';
    const data = EnterpriseDataEngine.extract(rawText);

    assert.strictEqual(data.city, 'Chicago');
    assert.strictEqual(data.state, 'Illinois');
    assert.strictEqual(data.country, 'USA');
  });
});
