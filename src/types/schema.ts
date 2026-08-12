export interface ExtractedData {
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  order_number: string | null;
  product: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  purchase_date: string | null;
  delivery_date: string | null;
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled' | 'Completed' | null;
  amount: string | null;
  currency: string | null;
}

export interface PresetSample {
  id: string;
  title: string;
  category: 'Standard Order' | 'Invoice' | 'Prompt Injection Safety' | 'Support Email' | 'Multi-item';
  rawText: string;
  description: string;
}

export interface BatchItem {
  id: string;
  filename: string;
  rawText: string;
  result: ExtractedData | null;
  status: 'idle' | 'processing' | 'done' | 'error';
  extractedAt?: string;
}
