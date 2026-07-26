/* ==========================================================================
   PAYMENT GATEWAY & SUBSCRIPTION MANAGER (RAZORPAY INTEGRATION)
   ========================================================================== */

export class PaymentManager {
  constructor() {
    this.storageKey = 'ai_app_builder_subscription';
    this.historyKey = 'ai_app_builder_payment_history';
    
    this.subscription = JSON.parse(localStorage.getItem(this.storageKey)) || {
      plan: 'Free',
      billingCycle: 'monthly',
      status: 'Active',
      renewsAt: 'Never',
      maxProjects: 3,
      unlimitedExports: false
    };

    this.history = JSON.parse(localStorage.getItem(this.historyKey)) || [
      {
        id: 'INV-2026-001',
        date: '2026-07-01',
        plan: 'Free Plan',
        amount: '₹0',
        status: 'Paid',
        gateway: 'System'
      }
    ];
  }

  saveSubscription() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.subscription));
  }

  saveHistory() {
    localStorage.setItem(this.historyKey, JSON.stringify(this.history));
  }

  /**
   * Process simulated Razorpay Checkout
   */
  async processRazorpayPayment(planName, cycle = 'monthly', amount) {
    return new Promise((resolve) => {
      // Simulate Razorpay Gateway Popup delay
      setTimeout(() => {
        const transactionId = 'pay_' + Math.random().toString(36).substring(2, 12);
        const invoiceId = 'INV-2026-' + Math.floor(1000 + Math.random() * 9000);

        // Update current user subscription
        this.subscription = {
          plan: planName,
          billingCycle: cycle,
          status: 'Active',
          renewsAt: cycle === 'yearly' ? '2027-07-26' : '2026-08-26',
          maxProjects: planName === 'Pro' ? 9999 : 99999,
          unlimitedExports: true,
          activatedAt: new Date().toISOString()
        };
        this.saveSubscription();

        // Add payment history entry
        const record = {
          id: invoiceId,
          transactionId,
          date: new Date().toISOString().split('T')[0],
          plan: `${planName} Subscription (${cycle})`,
          amount: `₹${amount}`,
          status: 'Paid',
          gateway: 'Razorpay UPI/Card'
        };
        this.history.unshift(record);
        this.saveHistory();

        resolve({ success: true, transactionId, invoiceId, plan: planName });
      }, 1500);
    });
  }

  /**
   * Generate Printable / Downloadable HTML Invoice Window
   */
  downloadInvoice(invoiceId) {
    const item = this.history.find(h => h.id === invoiceId) || this.history[0];
    
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${item.id} - AI App Builder Free</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
    .brand { font-size: 24px; font-weight: bold; color: #6366f1; }
    .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    .table th, .table td { padding: 12px; border: 1px solid #ddd; text-align: left; }
    .table th { background: #f8fafc; }
    .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
    .footer { margin-top: 50px; font-size: 12px; color: #777; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">AI App Builder Free</div>
      <p>Official Billing Invoice</p>
    </div>
    <div style="text-align: right;">
      <h3>INVOICE</h3>
      <p># ${item.id}</p>
      <p>Date: ${item.date}</p>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Payment Gateway</th>
        <th>Status</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${item.plan}</td>
        <td>${item.gateway}</td>
        <td><span style="color: green; font-weight: bold;">${item.status}</span></td>
        <td>${item.amount}</td>
      </tr>
    </tbody>
  </table>

  <div class="total">Total Paid: ${item.amount}</div>

  <div class="footer">
    <p>Thank you for subscribing to AI App Builder Free!</p>
    <p>Support contact: support@aiappbuilderfree.com</p>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      alert('Pop-up blocked. Downloading invoice file...');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${item.id}.html`;
      a.click();
    }
  }
}
