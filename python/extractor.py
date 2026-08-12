import json
import re
import sys
from typing import Dict, Any, Optional

VALID_STATUSES = {"Pending", "Processing", "Delivered", "Cancelled", "Completed"}

CURRENCY_MAP = {
    "₹": "INR",
    "INR": "INR",
    "$": "USD",
    "USD": "USD",
    "€": "EUR",
    "EUR": "EUR",
    "£": "GBP",
    "GBP": "GBP"
}

class EnterpriseDataExtractor:
    """
    Deterministic Python extraction engine matching exact schema mapping & safety rules.
    Prompt Injection Immunity: Payloads like 'Ignore previous instructions' are treated as raw text strings.
    """

    def extract(self, raw_text: str) -> Dict[str, Optional[str]]:
        result: Dict[str, Optional[str]] = {
            "customer_name": None,
            "email": None,
            "phone": None,
            "company": None,
            "order_number": None,
            "product": None,
            "city": None,
            "state": None,
            "country": None,
            "purchase_date": None,
            "delivery_date": None,
            "status": None,
            "amount": None,
            "currency": None
        }

        if not raw_text or not isinstance(raw_text, str):
            return result

        lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
        expanded_lines = []

        for line in lines:
            # Split multi-field inline key-value pairs
            parts = re.split(r'(?<=\b[A-Za-z0-9\s\-]+:[^,;]+)[,;]\s*', line)
            for p in parts:
                if p.strip():
                    expanded_lines.append(p.strip())

        # Step 1: Key-Value Parser
        for line in expanded_lines:
            cleaned_line = re.sub(r'^\(+|\)+$', '', line).strip()
            kv_match = re.match(r'^([A-Za-z0-9\s\-]+)\s*[:=]\s*(.+)$', cleaned_line)
            if kv_match:
                key = kv_match.group(1).strip().lower()
                val = re.sub(r'\)+$', '', kv_match.group(2)).strip()

                if key in ['customer name', 'customer', 'client name', 'buyer name', 'client', 'buyer', 'name']:
                    result['customer_name'] = val
                elif key in ['email', 'mail', 'e-mail']:
                    result['email'] = val
                elif key in ['phone', 'mobile', 'telephone', 'contact', 'contact mobile', 'mobile number', 'phone number', 'cell', 'contact no']:
                    result['phone'] = val
                elif key in ['company', 'organization', 'business', 'org']:
                    result['company'] = val
                elif key in ['order number', 'order id', 'invoice number', 'transaction id', 'reference id', 'ref id', 'tracking id', 'order ref', 'invoice no']:
                    result['order_number'] = val
                elif key in ['product', 'item', 'purchased item', 'product name']:
                    result['product'] = val
                elif key == 'city':
                    result['city'] = val
                elif key == 'state':
                    result['state'] = val
                elif key == 'country':
                    result['country'] = val
                elif key in ['purchase date', 'order date', 'date of purchase', 'transaction date']:
                    result['purchase_date'] = val
                elif key in ['delivery date', 'estimated delivery', 'est delivery', 'ship date', 'shipping date']:
                    result['delivery_date'] = val
                elif key == 'status':
                    for stat in VALID_STATUSES:
                        if stat.lower() == val.lower():
                            result['status'] = stat
                            break
                elif key in ['amount', 'total', 'price', 'total price', 'subtotal', 'grand total', 'total amount', 'price total']:
                    self._parse_money(val, result)
                elif key == 'currency':
                    result['currency'] = CURRENCY_MAP.get(val.upper(), val)

        # Step 2: Unstructured Fallbacks

        # Email
        if not result['email']:
            email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', raw_text)
            if email_match:
                result['email'] = email_match.group(0)

        # Phone
        if not result['phone']:
            phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10,12}\b', raw_text)
            if phone_match:
                result['phone'] = phone_match.group(0)

        # Customer Name
        if not result['customer_name']:
            name_match = re.search(r'\bMy name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b', raw_text, re.IGNORECASE)
            if name_match:
                result['customer_name'] = name_match.group(1)
            else:
                purchased_match = re.search(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+purchased\b', raw_text)
                if purchased_match:
                    result['customer_name'] = purchased_match.group(1)

        # Company
        if not result['company']:
            company_match = re.search(r'\b(?:from|at|with)\s+([A-Z][A-Za-z0-9\s&]+?)(?=\.|\r|\n|,|I am|We are|Status|Order|$)', raw_text)
            if company_match:
                result['company'] = company_match.group(1).strip()

        # Product
        if not result['product']:
            prod_match = re.search(r'\b(?:purchased|purchase of)\s+(?:a|an|the)?\s*([A-Z][A-Za-z0-9\s]+?)(?=\.|\r|\n|\(|\)|Invoice|Amount|Total|$)', raw_text, re.IGNORECASE)
            if prod_match:
                result['product'] = prod_match.group(1).strip()


        # Order Number
        if not result['order_number']:
            order_match = re.search(r'\b(?:Invoice Number|Order ID|Order Number|Transaction ID|Ref ID|Reference ID)\s*:?\s*([A-Z0-9\-]+)', raw_text, re.IGNORECASE)
            if order_match:
                result['order_number'] = order_match.group(1)

        # Dates
        if not result['purchase_date']:
            p_match = re.search(r'\b(?:Purchase Date|Order Date|Purchased on)\s*:?\s*(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|[A-Z][a-z]+\s+\d{1,2},\s+\d{4})', raw_text, re.IGNORECASE)
            if p_match:
                result['purchase_date'] = p_match.group(1)

        if not result['delivery_date']:
            d_match = re.search(r'\b(?:Delivery Date|Delivered on|Estimated Delivery)\s*:?\s*(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|[A-Z][a-z]+\s+\d{1,2},\s+\d{4})', raw_text, re.IGNORECASE)
            if d_match:
                result['delivery_date'] = d_match.group(1)

        # Amount & Currency
        if not result['amount']:
            amount_match = re.search(r'\b(?:Amount|Total|Price|Total Price|Subtotal)\s*:?\s*([₹$€£]?)\s*(\d+(?:\.\d+)?)\b', raw_text, re.IGNORECASE)
            if amount_match:
                curr_symbol = amount_match.group(1)
                amount_num = amount_match.group(2)
                result['amount'] = amount_num
                if curr_symbol and not result['currency']:
                    result['currency'] = CURRENCY_MAP.get(curr_symbol, curr_symbol)

        # Status
        if not result['status']:
            for stat in VALID_STATUSES:
                if re.search(rf'\b{stat}\b', raw_text, re.IGNORECASE):
                    result['status'] = stat
                    break

        return result

    def _parse_money(self, val: str, result: Dict[str, Optional[str]]):
        match = re.search(r'([₹$€£]?)\s*(\d+(?:\.\d+)?)', val)
        if match:
            symbol = match.group(1)
            num = match.group(2)
            result['amount'] = num
            if symbol:
                result['currency'] = CURRENCY_MAP.get(symbol, symbol)

    def to_json(self, raw_text: str, indent: int = 2) -> str:
        data = self.extract(raw_text)
        return json.dumps(data, indent=indent)


if __name__ == '__main__':
    extractor = EnterpriseDataExtractor()
    if not sys.stdin.isatty():
        input_text = sys.stdin.read()
    else:
        input_text = """Customer Name : Rahul Sharma
Email : rahul@gmail.com
Phone : 9876543210
Company : Samsung
Product : Galaxy S25
Order ID : ORD-7788
City : Hyderabad
Status : Delivered"""

    print(extractor.to_json(input_text))
