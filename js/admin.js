/* ==========================================================================
   ADMIN DASHBOARD CONTROLLER
   Analytics, User Management, Subscription Table & Revenue Reporting
   ========================================================================== */

export class AdminDashboardManager {
  constructor() {
    this.stats = {
      totalUsers: 14820,
      activeUsers: 9340,
      totalProjects: 42150,
      monthlyRevenue: 284500
    };

    this.users = [
      { id: 'usr_1', name: 'Alex Johnson', email: 'alex@example.com', plan: 'Pro', projects: 14, status: 'Active', joined: '2026-06-12' },
      { id: 'usr_2', name: 'Sarah Miller', email: 'sarah@design.io', plan: 'Business', projects: 29, status: 'Active', joined: '2026-05-18' },
      { id: 'usr_3', name: 'David Chen', email: 'david@tech.com', plan: 'Free', projects: 2, status: 'Active', joined: '2026-07-02' },
      { id: 'usr_4', name: 'Elena Rostova', email: 'elena@art.org', plan: 'Pro', projects: 8, status: 'Active', joined: '2026-06-25' },
      { id: 'usr_5', name: 'Marcus Vance', email: 'marcus@startup.co', plan: 'Free', projects: 3, status: 'Suspended', joined: '2026-07-10' }
    ];
  }

  toggleUserStatus(userId) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'Active' ? 'Suspended' : 'Active';
    }
  }
}
