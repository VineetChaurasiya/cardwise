"""One-off script to load the original mock card catalog into Supabase.
Run with: python seed.py (after applying migrations/001_init.sql)
"""

from app.services.supabase_client import get_supabase

CARDS = [
    {"id": "hdfc-millennia", "issuer": "HDFC Bank", "name": "Millennia", "network": "Visa",
     "gradient": "from-fuchsia-500 via-purple-600 to-indigo-700", "annual_fee": "₹1,000"},
    {"id": "sbi-cashback", "issuer": "SBI Card", "name": "Cashback", "network": "Visa",
     "gradient": "from-sky-500 via-blue-600 to-indigo-800", "annual_fee": "₹999"},
    {"id": "amex-platinum-travel", "issuer": "American Express", "name": "Platinum Travel", "network": "Amex",
     "gradient": "from-slate-300 via-slate-400 to-slate-600", "annual_fee": "₹3,500"},
    {"id": "axis-ace", "issuer": "Axis Bank", "name": "ACE", "network": "Visa",
     "gradient": "from-rose-500 via-pink-600 to-red-700", "annual_fee": "₹499"},
    {"id": "icici-amazon-pay", "issuer": "ICICI Bank", "name": "Amazon Pay", "network": "Visa",
     "gradient": "from-amber-400 via-orange-500 to-amber-700", "annual_fee": "Lifetime free"},
    {"id": "hdfc-regalia", "issuer": "HDFC Bank", "name": "Regalia Gold", "network": "Visa",
     "gradient": "from-yellow-500 via-amber-600 to-yellow-800", "annual_fee": "₹2,500"},
    {"id": "flipkart-axis", "issuer": "Axis Bank", "name": "Flipkart Axis Bank", "network": "Mastercard",
     "gradient": "from-blue-500 via-cyan-600 to-teal-700", "annual_fee": "₹500"},
    {"id": "idfc-millennia-edu", "issuer": "IDFC First Bank", "name": "Select", "network": "Visa",
     "gradient": "from-emerald-500 via-teal-600 to-cyan-800", "annual_fee": "Lifetime free"},
]

REWARD_RULES = [
    {"card_id": "hdfc-millennia", "category": "online_shopping", "reward_rate": "5% cashback", "note": "On Amazon, Flipkart, Myntra & more"},
    {"card_id": "hdfc-millennia", "category": "grocery", "reward_rate": "1% cashback", "note": "Standard rate on grocery spends"},
    {"card_id": "hdfc-millennia", "category": "dining", "reward_rate": "1% cashback", "note": "Standard rate"},
    {"card_id": "hdfc-millennia", "category": "utility", "reward_rate": "1% cashback", "note": "Standard rate"},

    {"card_id": "sbi-cashback", "category": "online_shopping", "reward_rate": "5% cashback", "note": "Uncapped online spends"},
    {"card_id": "sbi-cashback", "category": "utility", "reward_rate": "1% cashback", "note": "Standard rate"},
    {"card_id": "sbi-cashback", "category": "grocery", "reward_rate": "1% cashback", "note": "Standard rate"},

    {"card_id": "amex-platinum-travel", "category": "travel", "reward_rate": "5X points", "note": "On flight & hotel bookings via Amex Travel"},
    {"card_id": "amex-platinum-travel", "category": "dining", "reward_rate": "2X points", "note": "Select dining partners"},
    {"card_id": "amex-platinum-travel", "category": "entertainment", "reward_rate": "1X points", "note": "Standard rate"},

    {"card_id": "axis-ace", "category": "utility", "reward_rate": "5% cashback", "note": "Bill payments via Google Pay"},
    {"card_id": "axis-ace", "category": "grocery", "reward_rate": "4% cashback", "note": "On Swiggy, Zomato & BBPS bills"},
    {"card_id": "axis-ace", "category": "dining", "reward_rate": "4% cashback", "note": "Via Swiggy/Zomato"},
    {"card_id": "axis-ace", "category": "online_shopping", "reward_rate": "1.5% cashback", "note": "Standard rate"},

    {"card_id": "icici-amazon-pay", "category": "online_shopping", "reward_rate": "5% cashback", "note": "On Amazon for Prime members"},
    {"card_id": "icici-amazon-pay", "category": "utility", "reward_rate": "2% cashback", "note": "On Amazon Pay balance loads & bills"},
    {"card_id": "icici-amazon-pay", "category": "grocery", "reward_rate": "1% cashback", "note": "Standard rate"},

    {"card_id": "hdfc-regalia", "category": "travel", "reward_rate": "5X reward points", "note": "On Club Vistara & MMT bookings"},
    {"card_id": "hdfc-regalia", "category": "dining", "reward_rate": "4X reward points", "note": "On weekend dining"},
    {"card_id": "hdfc-regalia", "category": "education", "reward_rate": "1X reward points", "note": "Standard rate"},
    {"card_id": "hdfc-regalia", "category": "fuel", "reward_rate": "1% surcharge waiver", "note": "On fuel transactions"},

    {"card_id": "flipkart-axis", "category": "online_shopping", "reward_rate": "5% cashback", "note": "On Flipkart & Myntra"},
    {"card_id": "flipkart-axis", "category": "travel", "reward_rate": "4% cashback", "note": "On preferred travel partners"},
    {"card_id": "flipkart-axis", "category": "utility", "reward_rate": "1.5% cashback", "note": "Standard rate"},

    {"card_id": "idfc-millennia-edu", "category": "education", "reward_rate": "5X reward points", "note": "On education spends, no markup fee"},
    {"card_id": "idfc-millennia-edu", "category": "grocery", "reward_rate": "3X reward points", "note": "On grocery spends"},
    {"card_id": "idfc-millennia-edu", "category": "dining", "reward_rate": "6X reward points", "note": "On dining"},
    {"card_id": "idfc-millennia-edu", "category": "utility", "reward_rate": "3X reward points", "note": "Standard rate"},
]


def main():
    supabase = get_supabase()
    supabase.table("cards").upsert(CARDS).execute()
    supabase.table("reward_rules").delete().neq("card_id", "").execute()
    supabase.table("reward_rules").insert(REWARD_RULES).execute()
    print(f"Seeded {len(CARDS)} cards and {len(REWARD_RULES)} reward rules.")


if __name__ == "__main__":
    main()
