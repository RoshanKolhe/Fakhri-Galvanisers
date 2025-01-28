import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

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
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  customer: icon('ic_customer'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
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
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
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
        ],
      },
    ],
    [t]
  );

  return data;
}
