import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  inquiry: icon('ic_inquiry'),
  hsnMaster: icon('ic_hsnMaster'),
  processes: icon('ic_processes'),
  challan: icon('ic_challan'),
  quotation: icon('ic_quotation'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  customer: icon('ic_customer'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  qcReport: icon('ic_qcReport'),
  dispatch: icon('ic_dispatch'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  items: icon('ic_material'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const { user } = useAuthContext();
  let data = [];
  if (user && user.permissions.includes('super_admin')) {
    data = [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [{ title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard }],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // USER
          {
            title: t('user'),
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            roles: ['super_admin'],
            children: [
              { title: t('list'), path: paths.dashboard.user.list, roles: ['super_admin'] },
              { title: t('create'), path: paths.dashboard.user.new, roles: ['super_admin'] },
            ],
          },

          // CUSTOMER
          {
            title: t('customer'),
            path: paths.dashboard.customer.root,
            icon: ICONS.customer,
            roles: ['super_admin'],
            children: [
              { title: t('list'), path: paths.dashboard.customer.list, roles: ['super_admin'] },
              { title: t('create'), path: paths.dashboard.customer.new, roles: ['super_admin'] },
            ],
          },

          // INQUIRY
          {
            title: t('inquiry'),
            path: paths.dashboard.inquiry.root,
            icon: ICONS.inquiry,
            roles: ['super_admin'],
            children: [
              { title: t('list'), path: paths.dashboard.inquiry.list, roles: ['super_admin'] },
            ],
          },

          // QUOTATION
          {
            title: t('quotation'),
            path: paths.dashboard.quotation.root,
            icon: ICONS.quotation,
            roles: ['super_admin', 'customer'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.quotation.list,
                roles: ['super_admin', 'customer'],
              },
              {
                title: t('create'),
                path: paths.dashboard.quotation.new,
                roles: ['super_admin', 'customer'],
              },
            ],
          },

          // CHALLAN
          {
            title: t('challan'),
            path: paths.dashboard.challan.root,
            icon: ICONS.challan,
            children: [
              {
                title: t('list'),
                path: paths.dashboard.challan.list,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
              {
                title: t('create'),
                path: paths.dashboard.challan.new,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
            ],
          },

          // ORDER
          {
            title: t('order'),
            path: paths.dashboard.order.root,
            icon: ICONS.order,
            roles: ['super_admin', 'customer', 'supervisor'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.order.root,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
              {
                title: t('create'),
                path: paths.dashboard.order.new,
                roles: ['super_admin', 'supervisor'],
              },
            ],
          },

          // QC REPORT
          {
            title: t('qc Report'),
            path: paths.dashboard.qcReport.root,
            icon: ICONS.qcReport,
            roles: ['super_admin'],
            children: [
              { title: t('list'), path: paths.dashboard.qcReport.root, roles: ['super_admin', 'supervisor'] },
            ],
          },

          // INVOICE
          {
            title: t('proforma invoice'),
            path: paths.dashboard.invoice.root,
            icon: ICONS.invoice,
            children: [{ title: t('list'), path: paths.dashboard.invoice.root }],
          },

          // Dispatch
          {
            title: t('dispatch'),
            path: paths.dashboard.dispatch.root,
            icon: ICONS.dispatch,
            roles: ['super_admin', 'customer', 'supervisor'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.dispatch.root,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
            ],
          },
        ],
      },
      {
        subheader: t('masters'),
        items: [
          // HSN MASTER
          {
            title: t('hsnMaster'),
            path: paths.dashboard.hsnMaster.root,
            icon: ICONS.hsnMaster,
            roles: ['super_admin'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.hsnMaster.list,
                roles: ['super_admin'],
              },
              {
                title: t('create'),
                path: paths.dashboard.hsnMaster.new,
                roles: ['super_admin'],
              },
            ],
          },

          // ITEMS MASTER
          {
            title: t('Items Master'),
            path: paths.dashboard.itemsMaster.root,
            icon: ICONS.items,
            roles: ['super_admin'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.itemsMaster.list,
                roles: ['super_admin'],
              },
              {
                title: t('create'),
                path: paths.dashboard.itemsMaster.new,
                roles: ['super_admin'],
              },
            ],
          },

          // PROCESSES
          {
            title: t('processes'),
            path: paths.dashboard.processes.root,
            icon: ICONS.processes,
            roles: ['super_admin'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.processes.list,
                roles: ['super_admin'],
              },
              {
                title: t('create'),
                path: paths.dashboard.processes.new,
                roles: ['super_admin'],
              },
            ],
          },
        ],
      },
    ];
  }

  if (user && user.permissions.includes('admin')) {
    data = [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [{ title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard }],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // QUOTATION
          {
            title: t('quotation'),
            path: paths.dashboard.quotation.root,
            icon: ICONS.quotation,
            roles: ['super_admin', 'admin', 'customer'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.quotation.list,
                roles: ['super_admin', 'admin', 'customer'],
              },
              {
                title: t('create'),
                path: paths.dashboard.quotation.new,
                roles: ['super_admin', 'admin', 'customer'],
              },
            ],
          },

          // CHALLAN
          {
            title: t('challan'),
            path: paths.dashboard.challan.root,
            icon: ICONS.challan,
            children: [
              {
                title: t('list'),
                path: paths.dashboard.challan.list,
                roles: ['super_admin', 'admin', 'customer'],
              },
              {
                title: t('create'),
                path: paths.dashboard.challan.new,
                roles: ['super_admin', 'admin', 'customer'],
              },
            ],
          },

          // ORDER
          {
            title: t('order'),
            path: paths.dashboard.order.root,
            icon: ICONS.order,
            roles: ['super_admin', 'admin', 'customer'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.order.root,
                roles: ['super_admin', 'admin', 'customer'],
              },
            ],
          },

          // QC REPORT
          {
            title: t('qc Report'),
            path: paths.dashboard.qcReport.root,
            icon: ICONS.qcReport,
            roles: ['super_admin', 'admin'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.qcReport.root,
                roles: ['super_admin', 'admin'],
              },
            ],
          },

          // INVOICE
          {
            title: t('proforma invoice'),
            path: paths.dashboard.invoice.root,
            icon: ICONS.invoice,
            children: [{ title: t('list'), path: paths.dashboard.invoice.root }],
          },

          // Dispatch
          {
            title: t('dispatch'),
            path: paths.dashboard.dispatch.root,
            icon: ICONS.dispatch,
            roles: ['super_admin', 'admin', 'customer'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.dispatch.root,
                roles: ['super_admin', 'admin', 'customer'],
              },
            ],
          },
        ],
      },
      {
        subheader: t('masters'),
        items: [
          // HSN MASTER
          {
            title: t('hsnMaster'),
            path: paths.dashboard.hsnMaster.root,
            icon: ICONS.hsnMaster,
            roles: ['super_admin', 'admin'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.hsnMaster.list,
                roles: ['super_admin', 'admin'],
              },
              {
                title: t('create'),
                path: paths.dashboard.hsnMaster.new,
                roles: ['super_admin', 'admin'],
              },
            ],
          },

          // PROCESSES
          {
            title: t('processes'),
            path: paths.dashboard.processes.root,
            icon: ICONS.processes,
            roles: ['super_admin', 'admin'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.processes.list,
                roles: ['super_admin', 'admin'],
              },
              {
                title: t('create'),
                path: paths.dashboard.processes.new,
                roles: ['super_admin', 'admin'],
              },
            ],
          },
        ],
      },
    ];
  }

  if (user && user.permissions.includes('customer')) {
    data = [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [{ title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard }],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // QUOTATION
          {
            title: t('quotation'),
            path: paths.dashboard.quotation.root,
            icon: ICONS.quotation,
            roles: ['super_admin', 'customer'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.quotation.list,
                roles: ['super_admin', 'customer'],
              },
              {
                title: t('create'),
                path: paths.dashboard.quotation.new,
                roles: ['super_admin', 'customer'],
              },
            ],
          },

          // CHALLAN
          {
            title: t('challan'),
            path: paths.dashboard.challan.root,
            icon: ICONS.challan,
            children: [
              {
                title: t('list'),
                path: paths.dashboard.challan.list,
                roles: ['super_admin', 'customer'],
              },
              {
                title: t('create'),
                path: paths.dashboard.challan.new,
                roles: ['super_admin', 'customer'],
              },
            ],
          },

          // ORDER
          {
            title: t('order'),
            path: paths.dashboard.order.root,
            icon: ICONS.order,
            roles: ['super_admin', 'customer'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.order.root,
                roles: ['super_admin', 'customer'],
              },
            ],
          },

          // // QC REPORT
          // {
          //   title: t('qc Report'),
          //   path: paths.dashboard.qcReport.root,
          //   icon: ICONS.qcReport,
          //   roles: ['super_admin', 'customer'],
          //   children: [
          //     {
          //       title: t('list'),
          //       path: paths.dashboard.qcReport.root,
          //       roles: ['super_admin', 'customer'],
          //     },
          //   ],
          // },

          // INVOICE
          {
            title: t('proforma invoice'),
            path: paths.dashboard.invoice.root,
            icon: ICONS.invoice,
            children: [{ title: t('list'), path: paths.dashboard.invoice.root }],
          },

          // Dispatch
          {
            title: t('dispatch'),
            path: paths.dashboard.dispatch.root,
            icon: ICONS.dispatch,
            roles: ['super_admin', 'customer'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.dispatch.root,
                roles: ['super_admin', 'customer'],
              },
            ],
          },
        ],
      },
    ];
  }

    if (user && user.permissions.includes('supervisor')) {
    data = [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [{ title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard }],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // INQUIRY
          {
            title: t('inquiry'),
            path: paths.dashboard.inquiry.root,
            icon: ICONS.inquiry,
            roles: ['super_admin'],
            children: [
              { title: t('list'), path: paths.dashboard.inquiry.list, roles: ['super_admin', 'supervisor'] },
            ],
          },

          // QUOTATION
          {
            title: t('quotation'),
            path: paths.dashboard.quotation.root,
            icon: ICONS.quotation,
            roles: ['super_admin', 'customer', 'supervisor'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.quotation.list,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
              {
                title: t('create'),
                path: paths.dashboard.quotation.new,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
            ],
          },

          // CHALLAN
          {
            title: t('challan'),
            path: paths.dashboard.challan.root,
            icon: ICONS.challan,
            children: [
              {
                title: t('list'),
                path: paths.dashboard.challan.list,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
              {
                title: t('create'),
                path: paths.dashboard.challan.new,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
            ],
          },

          // ORDER
          {
            title: t('order'),
            path: paths.dashboard.order.root,
            icon: ICONS.order,
            roles: ['super_admin', 'customer', 'supervisor'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.order.root,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
              {
                title: t('create'),
                path: paths.dashboard.order.new,
                roles: ['super_admin', 'supervisor'],
              },
            ],
          },

          // QC REPORT
          {
            title: t('qc Report'),
            path: paths.dashboard.qcReport.root,
            icon: ICONS.qcReport,
            roles: ['super_admin'],
            children: [
              { title: t('list'), path: paths.dashboard.qcReport.root, roles: ['super_admin', 'supervisor'] },
            ],
          },

          // INVOICE
          {
            title: t('proforma invoice'),
            path: paths.dashboard.invoice.root,
            icon: ICONS.invoice,
            children: [{ title: t('list'), path: paths.dashboard.invoice.root }],
          },

          // Dispatch
          {
            title: t('dispatch'),
            path: paths.dashboard.dispatch.root,
            icon: ICONS.dispatch,
            roles: ['super_admin', 'customer', 'supervisor'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.dispatch.root,
                roles: ['super_admin', 'customer', 'supervisor'],
              },
            ],
          },
        ],
      },
    ];
  }

  return data;
}
