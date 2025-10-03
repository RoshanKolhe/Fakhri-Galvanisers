import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/me',
    customer: {
      me: '/customer/me',
      login: '/customer/login',
    },
    login: '/login',
    register: '/register',
  },
  user: {
    list: '/api/users/list',
    notifications: '/notifications',
    filterNotificationList: (filter) => `/notifications?${filter}`,
    filterList: (filter) => `/api/users/list?${filter}`,
    details: (id) => `/api/users/${id}`,
    search: '/api/user/search',
    getDashboradCounts: '/getDashboardCounts',
  },
  customer: {
    list: '/customer/list',
    filterList: (filter) => `/customer/list?filter=${filter}`,
    details: (id) => `/customer/${id}`,
    getCustomerDashboradCounts: '/customer/getDashboardCounts',
  },
  quotation: {
    list: '/quotations',
    filterList: (filter) => `/quotations?$filter=${filter}`,
    details: (id) => `/quotations/${id}`,
  },
  notification: {
    list: '/notifications',
  },
  hsnMaster: {
    list: '/hsn-masters',
    filterList: (filter) => `/hsn-masters?filter=${filter}`,
    details: (id) => `/hsn-masters/${id}`,
  },

  // ITEMS MASTER
  itemsMaster: {
    list: '/items',
    filterList: (filter) => `/items?filter=${filter}`,
    details: (id) => `/items/${id}`,
  },
  order: {
    list: '/orders',
    filterList: (filter) => `/orders?filter=${filter}`,
    details: (id) => `/orders/${id}`,
  },
  payment: {
    list: '/payments',
    filterList: (filter) => `/payments?${filter}`,
    details: (id) => `/payments/${id}`,
  },
  qcReport: {
    list: '/qc-reports',
    filterList: (filter) => `/qc-reports?${filter}`,
    details: (id) => `/qc-reports/${id}`,
  },
  dispatch: {
    list: '/dispatches',
    filterList: (filter) => `/dispatches?${filter}`,
    details: (id) => `/dispatches/${id}`,
  },
  processes: {
    list: '/processes',
    filterList: (filter) => `/processes?${filter}`,
    details: (id) => `/processes/${id}`,
  },
  challan: {
    list: '/challans',
    filterList: (filter) => `/challans?${filter}`,
    details: (id) => `/challans/${id}`,
    orderPendingChallan: `/challans/inwardChallans`,
  },
  inquiry: {
    list: '/inquiries',
    filterList: (filter) => `/inquiries?${filter}`,
    details: (id) => `/inquiries/${id}`,
    search: '/inquiries/search',
  },
};
