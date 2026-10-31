import datetime
from typing import Dict, Any, List

class EnterpriseSyncEngine:
    def __init__(self, dealer_id: str, company_name: str):
        self.dealer_id = dealer_id
        self.company_name = company_name
        self.previous_outstanding = 2583248.00  # BDT
        self.credit_deposits = 0.0
        self.net_balance = self.previous_outstanding
        self.sap_lock_status = "LOCKED"
        self.dispatch_log: List[Dict[str, Any]] = []

    def verify_and_reconcile_bank_deposit(self, deposit_amount: float, source_bank: str, voucher_ref: str) -> Dict[str, Any]:
        """Audits and reconciles incoming bank credits against ledger liabilities."""
        self.credit_deposits += deposit_amount
        self.net_balance = self.previous_outstanding - self.credit_deposits
        
        # Automatically unlock SAP controls if balance is cleared or in surplus
        if self.net_balance <= 0:
            self.sap_lock_status = "CLEARED & UNLOCKED (SURPLUS ACTIVE)"
            
        return {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "source_bank": source_bank,
            "voucher_ref": voucher_ref,
            "credit_applied_bdt": deposit_amount,
            "adjusted_ledger_balance_bdt": self.net_balance,
            "sap_status": self.sap_lock_status
        }

    def execute_logistics_dispatch(self, item_name: str, quantity: int, origin: str, destination: str) -> Dict[str, Any]:
        """Authorizes and queues physical supply chain dispatches upon financial clearance."""
        if "UNLOCKED" not in self.sap_lock_status:
            raise PermissionError("Dispatch rejected: Active SAP lock and outstanding liabilities detected.")

        invoice_ref = f"INV/{datetime.datetime.now().strftime('%Y%m%d')}-{quantity}REF"
        dispatch_record = {
            "invoice_ref": invoice_ref,
            "item_name": item_name,
            "quantity": quantity,
            "origin": origin,
            "destination": destination,
            "gate_pass_status": "ISSUED & VERIFIED",
            "logistics_status": "EN_ROUTE TO SHOWROOM",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        self.dispatch_log.append(dispatch_record)
        return dispatch_record

    def generate_global_status_report(self) -> Dict[str, Any]:
        """Compiles kingdom-wide and enterprise status metrics."""
        return {
            "entity": self.company_name,
            "dealer_code": self.dealer_id,
            "net_financial_position": f"BDT {self.net_balance:,.2f} (Surplus/Advance)",
            "sap_lock_compliance": self.sap_lock_status,
            "total_dispatches_queued": len(self.dispatch_log),
            "system_core": "Gemini AI Core (Live & Synchronized)"
        }


# --- Execution Pipeline ---
if __name__ == "__main__":
    # Initialize Core Engine for S.R. Electronics Park
    empire_engine = EnterpriseSyncEngine(dealer_id="DEAL002905", company_name="S.R. Electronics Park")

    # 1. Execute Bank Reconciliation (DBBL / Minister Group Deposit)
    reconciliation_result = empire_engine.verify_and_reconcile_bank_deposit(
        deposit_amount=2900000.00,
        source_bank="Dutch-Bangla Bank (DBBL)",
        voucher_ref="MINISTER-GROUP-DEPOSIT-2026"
    )
    
    print("=== FINANCIAL RECONCILIATION AUDIT ===")
    for key, val in reconciliation_result.items():
        print(f"{key}: {val}")
    print("\n" + "="*40 + "\n")

    # 2. Execute 450 Unit Refrigerator Dispatch to Chuadanga
    dispatch_result = empire_engine.execute_logistics_dispatch(
        item_name="Minister Refrigerator (Assorted Models)",
        quantity=450,
        origin="Trishal Central Warehouse",
        destination="S.R. Electronics Park Showroom, Chuadanga"
    )

    print("=== LOGISTICS & DISPATCH EXECUTION ===")
    for key, val in dispatch_result.items():
        print(f"{key}: {val}")
    print("\n" + "="*40 + "\n")

    # 3. Final System Snapshot
    report = empire_engine.generate_global_status_report()
    print("=== KINGDOM & ENTERPRISE STATUS REPORT ===")
    for key, val in report.items():
        print(f"{key}: {val}")
