/* ==========================================================================
   DONATION & SUPPORT ENGINE (UPI INTEGRATION)
   UPI ID: arasu9629hf@okhdfcbank
   ========================================================================== */

export class DonationManager {
  constructor() {
    this.upiId = 'arasu9629hf@okhdfcbank';
    this.storageKey = 'ai_app_builder_donations';
    this.selectedAmount = 250;

    this.history = JSON.parse(localStorage.getItem(this.storageKey)) || [
      { id: 'don_101', amount: 500, date: '2026-07-20', upi: 'user***@okicici', note: 'Awesome AI builder!' },
      { id: 'don_102', amount: 100, date: '2026-07-24', upi: 'dev***@paytm', note: 'Thanks for making it free!' }
    ];
  }

  saveHistory() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.history));
  }

  copyUpiId() {
    navigator.clipboard.writeText(this.upiId).then(() => {
      if (window.toast) {
        window.toast.success(`Copied UPI ID (${this.upiId}) to clipboard!`);
      }
    });
  }

  /**
   * Generate QR Code SVG / URL for UPI payment link
   */
  getUpiQrUrl(amount, note = 'Support AI App Builder Developer') {
    const upiUri = `upi://pay?pa=${this.upiId}&pn=AI%20App%20Builder%20Developer&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;
  }

  /**
   * Process simulated payment verification & trigger celebration modal
   */
  processDonation(amount, note = '') {
    const record = {
      id: 'don_' + Date.now().toString(36),
      amount: parseInt(amount, 10) || 100,
      date: new Date().toISOString().split('T')[0],
      upi: this.upiId,
      note: note || 'Support Developer'
    };

    this.history.unshift(record);
    this.saveHistory();
    return record;
  }
}
