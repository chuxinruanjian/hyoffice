import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

// 定义系统默认权限
const defaultPermissions = [
  // 用户管理权限
  { name: '用户列表', code: 'user:list' },
  { name: '创建用户', code: 'user:create' },
  { name: '编辑用户', code: 'user:update' },
  { name: '删除用户', code: 'user:delete' },
  // 角色管理权限
  { name: '角色列表', code: 'role:list' },
  { name: '创建角色', code: 'role:create' },
  { name: '编辑角色', code: 'role:update' },
  { name: '删除角色', code: 'role:delete' },
  { name: '分配角色权限', code: 'role:assign-permissions' },
  // 权限管理权限
  { name: '权限列表', code: 'permission:list' },
  { name: '创建权限', code: 'permission:create' },
  { name: '编辑权限', code: 'permission:update' },
  { name: '删除权限', code: 'permission:delete' },
  // 部门管理权限
  { name: '部门列表', code: 'department:list' },
  { name: '创建部门', code: 'department:create' },
  { name: '编辑部门', code: 'department:update' },
  { name: '删除部门', code: 'department:delete' },
  // 系统配置权限
  { name: '配置列表（含私密）', code: 'config:list' },
  { name: '创建配置', code: 'config:create' },
  { name: '编辑配置', code: 'config:update' },
  { name: '删除配置', code: 'config:delete' },
];

// 默认网站配置
const defaultSiteConfigs = [
  {
    key: 'siteTitle',
    value: '办公管理系统',
    description: '网站标题',
    group: 'general',
  },
  {
    key: 'siteDescription',
    value: '企业办公管理平台',
    description: '网站描述',
    group: 'general',
  },
  {
    key: 'siteLogo',
    value: '/logo.png',
    description: '网站Logo地址',
    group: 'appearance',
  },
  {
    key: 'siteFavicon',
    value: '/favicon.ico',
    description: '网站Favicon地址',
    group: 'appearance',
  },
  {
    key: 'copyright',
    value: '© 2026 办公管理系统. All rights reserved.',
    description: '版权信息',
    group: 'general',
  },
  {
    key: 'icpNumber',
    value: '',
    description: 'ICP备案号',
    group: 'general',
  },
];

async function main() {
  const password = await argon2.hash('admin');

  console.log('🌱 开始初始化种子数据...');

  // 1. 创建默认权限
  console.log('📋 创建默认权限...');
  for (const permission of defaultPermissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { name: permission.name },
      create: permission,
    });
  }
  console.log(`✅ 已创建 ${defaultPermissions.length} 个权限`);

  // 2. 获取所有权限ID（用于超级管理员角色）
  const allPermissions = await prisma.permission.findMany();
  const allPermissionIds = allPermissions.map((p) => ({ id: p.id }));

  // 3. 创建超级管理员角色（拥有所有权限）
  console.log('👑 创建超级管理员角色...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {
      description: '系统最高权限，拥有所有权限',
      permissions: { set: allPermissionIds },
    },
    create: {
      name: 'Administrator',
      description: '系统最高权限，拥有所有权限',
      permissions: { connect: allPermissionIds },
    },
  });

  // 4. 创建普通员工角色（基础权限）
  console.log('👤 创建普通员工角色...');
  const basicPermissions = await prisma.permission.findMany({
    where: {
      code: {
        in: ['user:list', 'department:list'],
      },
    },
  });
  await prisma.role.upsert({
    where: { name: 'Employee' },
    update: {
      description: '普通员工，拥有基础查看权限',
      permissions: { set: basicPermissions.map((p) => ({ id: p.id })) },
    },
    create: {
      name: 'Employee',
      description: '普通员工，拥有基础查看权限',
      permissions: { connect: basicPermissions.map((p) => ({ id: p.id })) },
    },
  });

  // 5. 创建部门经理角色
  console.log('👔 创建部门经理角色...');
  const managerPermissions = await prisma.permission.findMany({
    where: {
      code: {
        in: [
          'user:list',
          'user:create',
          'user:update',
          'department:list',
          'role:list',
        ],
      },
    },
  });
  await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {
      description: '部门经理，可管理本部门员工',
      permissions: { set: managerPermissions.map((p) => ({ id: p.id })) },
    },
    create: {
      name: 'Manager',
      description: '部门经理，可管理本部门员工',
      permissions: { connect: managerPermissions.map((p) => ({ id: p.id })) },
    },
  });

  // 6. 创建初始管理员用户
  console.log('🔐 创建初始管理员用户...');
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      roles: { set: [{ id: adminRole.id }] },
    },
    create: {
      username: 'admin',
      password: password,
      realName: '超级管理员',
      roles: { connect: { id: adminRole.id } },
    },
  });

  // 7. 创建默认网站配置
  console.log('⚙️ 创建默认网站配置...');
  for (const config of defaultSiteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log(`✅ 已创建 ${defaultSiteConfigs.length} 个配置项`);

  console.log('');
  console.log('✅ 种子数据初始化成功！');
  console.log('');
  console.log('📊 数据统计:');
  console.log(`   - 权限: ${allPermissions.length} 个`);
  console.log(`   - 角色: 3 个 (Administrator, Manager, Employee)`);
  console.log(`   - 用户: 1 个 (admin)`);
  console.log(`   - 配置: ${defaultSiteConfigs.length} 个`);
  console.log('');
  console.log('🔑 默认管理员账号:');
  console.log('   用户名: admin');
  console.log('   密码: admin');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
