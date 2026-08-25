import { useState } from 'react'
import {
  AdminLayout,
  Card,
  CardContent,
  CardHeader,
  DescriptionItem,
  DescriptionList,
  LocaleProvider,
  SegmentedControl,
  TenantSwitcher,
  toast,
  zhTW,
  type AdminNavGroup,
  type TenantItem,
} from '../../index'

type Role = 'platformAdmin' | 'member'

/**
 * The app layer owns permissions — the layout only receives a check
 * function. Here a role → permission map stands in for your auth store.
 */
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  platformAdmin: ['platform:access', 'billing:view'],
  member: [],
}

/**
 * Navigation is plain data: group-level `visibleWhen` hides whole
 * sections, item-level `permissions` hides single entries. Adding a page
 * for a new role is a data change, not a layout change.
 */
const NAVIGATION: AdminNavGroup[] = [
  {
    label: '總覽',
    items: [{ path: '/dashboard', label: '儀表板' }],
  },
  {
    label: '平台管理',
    visibleWhen: (ctx) => ctx.hasPermission?.(['platform:access']) ?? false,
    items: [
      { path: '/tenants', label: '租戶' },
      { path: '/platform-users', label: '平台使用者' },
    ],
  },
  {
    label: '營運',
    items: [
      { path: '/orders', label: '訂單' },
      { path: '/billing', label: '帳務', permissions: ['billing:view'] },
    ],
  },
  {
    label: '設定',
    items: [{ path: '/settings', label: '設定' }],
  },
]

const TENANTS: TenantItem[] = [
  {
    id: 't1',
    name: '宏達物流',
    slug: 'hongda',
    planLabel: 'Enterprise',
    status: '啟用',
    statusVariant: 'success',
  },
  { id: 't2', name: '晨星文創', slug: 'morningstar', planLabel: 'Pro' },
  {
    id: 't3',
    name: '青田餐飲',
    slug: 'aozora',
    planLabel: 'Starter',
    status: '試用',
    statusVariant: 'warning',
  },
]

/**
 * Recipe: a multi-tenant admin shell.
 *
 * Composition: LocaleProvider (zhTW, once at the root — every built-in
 * string and aria-label localizes from here) → AdminLayout (brand +
 * permission-aware navigation + user) → TenantSwitcher in the navbar,
 * controlled via `value`/`onChange`. Routing is simulated with useState;
 * in a real SPA keep `onNavigate` for imperative moves and also pass
 * `renderLink` so nav items render as your router's `<Link>` elements.
 * The role toggle in the content area stands in for your auth layer.
 */
export function TenantAdminShell() {
  const [role, setRole] = useState<Role>('platformAdmin')
  const [tenant, setTenant] = useState<TenantItem | null>(TENANTS[0])
  const [path, setPath] = useState('/dashboard')

  const hasPermission = (permissions: string[]) =>
    permissions.some((p) => ROLE_PERMISSIONS[role].includes(p))

  return (
    <LocaleProvider locale={zhTW}>
      <AdminLayout
        currentPath={path}
        onNavigate={setPath}
        navigation={NAVIGATION}
        brand={{ name: 'Arkite Cloud', shortName: 'A' }}
        user={{
          name: '林雨薇',
          email: 'yuwei@example.com',
          avatarFallback: '林',
          roleLabel: role === 'platformAdmin' ? '平台管理員' : '一般成員',
          roleBadgeVariant: role === 'platformAdmin' ? 'success' : 'secondary',
        }}
        hasPermission={hasPermission}
        onLogout={() => toast.success('已登出')}
        navbarLeft={<TenantSwitcher tenants={TENANTS} value={tenant} onChange={setTenant} />}
      >
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader
              title="目前狀態"
              description="切換角色觀察側欄導航依權限增減；切換租戶觀察受控的 value 更新。"
            />
            <CardContent className="space-y-4">
              <SegmentedControl
                size="sm"
                options={[
                  { value: 'platformAdmin', label: '平台管理員' },
                  { value: 'member', label: '一般成員' },
                ]}
                value={role}
                onChange={setRole}
              />
              <DescriptionList>
                <DescriptionItem label="目前路徑" value={path} />
                <DescriptionItem label="目前租戶" value={tenant ? tenant.name : '全部租戶'} />
              </DescriptionList>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </LocaleProvider>
  )
}
