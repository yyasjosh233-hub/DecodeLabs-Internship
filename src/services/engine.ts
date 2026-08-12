import type { ExtractedData } from '../types/schema';

const VALID_STATUSES = new Set(['Pending', 'Processing', 'Delivered', 'Cancelled', 'Completed']);

const CURRENCY_MAP: Record<string, string> = {
  '₹': 'INR',
  'INR': 'INR',
  '$': 'USD',
  'USD': 'USD',
  '€': 'EUR',
  'EUR': 'EUR',
  '£': 'GBP',
  'GBP': 'GBP'
};

export class EnterpriseDataEngine {
  /**
   * Deterministic extraction engine enforcing exact schema mapping & safety rules.
   */
  static extract(rawText: string): ExtractedData {
    const result: ExtractedData = {
      customer_name: null,
      email: null,
      phone: null,
      company: null,
      order_number: null,
      product: null,
      city: null,
      state: null,
      country: null,
      purchase_date: null,
      delivery_date: null,
      status: null,
      amount: null,
      currency: null
    };

    if (!rawText || typeof rawText !== 'string') {
      return result;
    }

    // Pre-process lines: split by newlines, then split multi-field inline key-value pairs (e.g. "City: X, State: Y, Country: Z")
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const expandedLines: string[] = [];

    for (const line of lines) {
      // Split on comma/semicolon only if line contains multiple Key: Value pairs
      const matches = line.split(/(?<=\b[A-Za-z0-9\s\-]+:[^,;]+)[,;]\s*/);
      for (const m of matches) {
        if (m.trim()) {
          expandedLines.push(m.trim());
        }
      }
    }

    // Step 1: Key-value parser for structured lines
    expandedLines.forEach(line => {
      // Clean leading/trailing parentheses e.g. "(Item: Industrial Servo Motor)" -> "Item: Industrial Servo Motor"
      const cleanedLine = line.replace(/^\(+|\)+$/g, '').trim();
      const kvMatch = cleanedLine.match(/^([A-Za-z0-9\s\-]+)\s*[:=]\s*(.+)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim().toLowerCase();
        const val = kvMatch[2].replace(/\)+$/g, '').trim();

        if (['customer name', 'customer', 'client name', 'buyer name', 'client', 'buyer', 'name'].includes(key)) {
          result.customer_name = val;
        } else if (['email', 'mail', 'e-mail'].includes(key)) {
          result.email = val;
        } else if (['phone', 'mobile', 'telephone', 'contact', 'contact mobile', 'mobile number', 'phone number', 'cell', 'contact no'].includes(key)) {
          result.phone = val;
        } else if (['company', 'organization', 'business', 'org'].includes(key)) {
          result.company = val;
        } else if (['order number', 'order id', 'invoice number', 'transaction id', 'reference id', 'ref id', 'tracking id', 'order ref', 'invoice no'].includes(key)) {
          result.order_number = val;
        } else if (['product', 'item', 'purchased item', 'product name'].includes(key)) {
          result.product = val;
        } else if (key === 'city') {
          result.city = val;
        } else if (key === 'state') {
          result.state = val;
        } else if (key === 'country') {
          result.country = val;
        } else if (['purchase date', 'order date', 'date of purchase', 'transaction date'].includes(key)) {
          result.purchase_date = val;
        } else if (['delivery date', 'estimated delivery', 'est delivery', 'ship date', 'shipping date'].includes(key)) {
          result.delivery_date = val;
        } else if (key === 'status') {
          for (const stat of VALID_STATUSES) {
            if (stat.toLowerCase() === val.toLowerCase()) {
              result.status = stat as ExtractedData['status'];
              break;
            }
          }
        } else if (['amount', 'total', 'price', 'total price', 'subtotal', 'grand total', 'total amount', 'price total'].includes(key)) {
          this.parseMoney(val, result);
        } else if (key === 'currency') {
          result.currency = CURRENCY_MAP[val.toUpperCase()] || val;
        }
      }
    });

    // Step 2: Pattern matchers for unstructured sentences

    // Email
    if (!result.email) {
      const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        result.email = emailMatch[0];
      }
    }

    // Phone (matches digits with optional dashes, spaces, parentheses)
    if (!result.phone) {
      const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10,12}\b/);
      if (phoneMatch) {
        result.phone = phoneMatch[0];
      }
    }

    // Customer Name (e.g. "My name is Sarah Connor", "Alice purchased...")
    if (!result.customer_name) {
      const nameMatch = rawText.match(/\bMy name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i);
      if (nameMatch) {
        result.customer_name = nameMatch[1];
      } else {
        const purchasedMatch = rawText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+purchased\b/);
        if (purchasedMatch) {
          result.customer_name = purchasedMatch[1];
        }
      }
    }

    // Company (e.g. "from Cyberdyne Systems", "at Acme Corp")
    if (!result.company) {
      const companyMatch = rawText.match(/\b(?:from|at|with)\s+([A-Z][A-Za-z0-9\s&]+?)(?=\.|\r|\n|,|I am|We are|Status|Order|$)/);
      if (companyMatch) {
        result.company = companyMatch[1].trim();
      }
    }

    // Product (e.g. "purchased a Dell Inspiron Laptop", "purchase of the Industrial Servo Motor")
    if (!result.product) {
      const prodMatch = rawText.match(/\b(?:purchased|purchase of)\s+(?:a|an|the)?\s*([A-Z][A-Za-z0-9\s]+?)(?=\.|\r|\n|\(|\)|Invoice|Amount|Total|$)/i);
      if (prodMatch) {
        result.product = prodMatch[1].trim();
      }
    }


    // Order number (e.g. "Invoice Number INV-9021", "Order ID ORD-7788", "Transaction ID: TXN-44912")
    if (!result.order_number) {
      const orderMatch = rawText.match(/\b(?:Invoice Number|Order ID|Order Number|Transaction ID|Ref ID|Reference ID)\s*:?\s*([A-Z0-9\-]+)/i);
      if (orderMatch) {
        result.order_number = orderMatch[1];
      }
    }

    // Dates (Purchase & Delivery dates from text like 2026-08-01)
    if (!result.purchase_date) {
      const pDateMatch = rawText.match(/\b(?:Purchase Date|Order Date|Purchased on)\s*:?\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|[A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i);
      if (pDateMatch) {
        result.purchase_date = pDateMatch[1];
      }
    }
    if (!result.delivery_date) {
      const dDateMatch = rawText.match(/\b(?:Delivery Date|Delivered on|Estimated Delivery)\s*:?\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|[A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i);
      if (dDateMatch) {
        result.delivery_date = dDateMatch[1];
      }
    }

    // Amount & Currency (e.g. "Amount ₹65000", "Total Price: $1250.00")
    if (!result.amount) {
      const amountMatch = rawText.match(/\b(?:Amount|Total|Price|Total Price|Subtotal)\s*:?\s*([₹$€£]?)\s*(\d+(?:\.\d+)?)\b/i);
      if (amountMatch) {
        const currSymbol = amountMatch[1];
        const amountNum = amountMatch[2];
        result.amount = amountNum;
        if (currSymbol && !result.currency) {
          result.currency = CURRENCY_MAP[currSymbol] || currSymbol;
        }
      }
    }

    // Status
    if (!result.status) {
      for (const stat of VALID_STATUSES) {
        const regex = new RegExp(`\\b${stat}\\b`, 'i');
        if (regex.test(rawText)) {
          result.status = stat as ExtractedData['status'];
          break;
        }
      }
    }

    return result;
  }

  private static parseMoney(val: string, result: ExtractedData) {
    const match = val.match(/([₹$€£]?)\s*(\d+(?:\.\d+)?)/);
    if (match) {
      const symbol = match[1];
      const num = match[2];
      result.amount = num;
      if (symbol) {
        result.currency = CURRENCY_MAP[symbol] || symbol;
      }
    }
  }

  static getExtractionStats(data: ExtractedData): { totalFields: number; matchedFields: number; completionPercentage: number } {
    const keys = Object.keys(data) as (keyof ExtractedData)[];
    const matched = keys.filter(k => data[k] !== null && data[k] !== undefined).length;
    const total = keys.length;
    return {
      totalFields: total,
      matchedFields: matched,
      completionPercentage: Math.round((matched / total) * 100)
    };
  }

  static toFormattedJson(data: ExtractedData): string {
    return JSON.stringify(data, null, 2);
  }

  static toCompactJson(data: ExtractedData): string {
    return JSON.stringify(data);
  }
}

