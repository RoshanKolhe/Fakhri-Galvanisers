// utils
import { paramCase } from 'src/utils/change-case';
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneUI: 'https://mui.com/store/items/zone-landing-page/',
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma:
    'https://www.figma.com/file/kAYnYYdib0aQPNKZpgJT6J/%5BPreview%5D-Minimal-Web.v5.0.0?type=design&node-id=0%3A1&t=Al4jScQq97Aly0Mn-1',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: {
      details: `/product/${MOCK_ID}`,
    },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: {
      details: `/post/${paramCase(MOCK_TITLE)}`,
    },
  },
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/admin/login`,
      register: `${ROOTS.AUTH}/admin/register`,
      forgotPassword: `${ROOTS.AUTH}/admin/forgot-password`,
      customerForgotPassword: `${ROOTS.AUTH}/admin/customer-forgot-password`,
      newPassword: `${ROOTS.AUTH}/admin/new-password`,
      newCustomerPassword: `${ROOTS.AUTH}/admin/customer-new-password`,
      customerLogin: `${ROOTS.AUTH}/admin/customer-login`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    profile: `${ROOTS.DASHBOARD}/profile`,
    customerProfile: `${ROOTS.DASHBOARD}/customer-profile`,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      view: (id) => `${ROOTS.DASHBOARD}/user/${id}/view`,
    },
    customer: {
      root: `${ROOTS.DASHBOARD}/customer`,
      new: `${ROOTS.DASHBOARD}/customer/new`,
      list: `${ROOTS.DASHBOARD}/customer/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/customer/${id}/edit`,
      view: (id) => `${ROOTS.DASHBOARD}/customer/${id}/view`,
    },
    inquiry: {
      root: `${ROOTS.DASHBOARD}/inquiry`,
      new: `${ROOTS.DASHBOARD}/inquiry/new`,
      list: `${ROOTS.DASHBOARD}/inquiry/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/inquiry/${id}/edit`,
    },
    quotation: {
      root: `${ROOTS.DASHBOARD}/quotation`,
      new: `${ROOTS.DASHBOARD}/quotation/new`,
      list: `${ROOTS.DASHBOARD}/quotation/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/quotation/${id}/edit`,
      view: (id) => `${ROOTS.DASHBOARD}/quotation/${id}/view`,
    },

    hsnMaster: {
      root: `${ROOTS.DASHBOARD}/hsnMaster`,
      new: `${ROOTS.DASHBOARD}/hsnMaster/new`,
      list: `${ROOTS.DASHBOARD}/hsnMaster/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/hsnMaster/${id}/edit`,
      view: (id) => `${ROOTS.DASHBOARD}/hsnMaster/${id}/view`,
    },
    processes: {
      root: `${ROOTS.DASHBOARD}/processes`,
      new: `${ROOTS.DASHBOARD}/processes/new`,
      list: `${ROOTS.DASHBOARD}/processes/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/processes/${id}/edit`,
      view: (id) => `${ROOTS.DASHBOARD}/processes/${id}/view`,
    },
    challan: {
      root: `${ROOTS.DASHBOARD}/challan`,
      new: `${ROOTS.DASHBOARD}/challan/new`,
      list: `${ROOTS.DASHBOARD}/challan/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/challan/${id}/edit`,
      view: (id) => `${ROOTS.DASHBOARD}/challan/${id}/view`,
    },

    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
    },
    qcReport: {
      root: `${ROOTS.DASHBOARD}/qcReport`,
      edit: (id) => `${ROOTS.DASHBOARD}/qcReport/${id}/edit`,
      view: (id) => `${ROOTS.DASHBOARD}/qcReport/${id}/view`,
    },
    dispatch: {
      root: `${ROOTS.DASHBOARD}/dispatch`,
      edit: (id) => `${ROOTS.DASHBOARD}/dispatch/${id}/edit`,
      view: (id) => `${ROOTS.DASHBOARD}/dispatch/${id}/view`,
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
  },
};
