const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');
const connectDB = require('../config/db');

const initialPermissions = [
  // User Management
  { name: 'user:read', description: 'View user accounts and profiles', category: 'user_management' },
  { name: 'user:create', description: 'Create new user accounts', category: 'user_management' },
  { name: 'user:update', description: 'Update existing user profiles and settings', category: 'user_management' },
  { name: 'user:delete', description: 'Delete or deactivate user accounts', category: 'user_management' },
  
  // Role Management
  { name: 'role:read', description: 'View security roles and permission mappings', category: 'role_management' },
  { name: 'role:create', description: 'Create custom security roles', category: 'role_management' },
  { name: 'role:update', description: 'Modify permissions assigned to roles', category: 'role_management' },
  { name: 'role:delete', description: 'Remove custom security roles', category: 'role_management' },

  // Reports & Analytics
  { name: 'report:read', description: 'View team performance and operational reports', category: 'general' },

  // Audit Logs
  { name: 'audit:read', description: 'View system audit logs and activity history', category: 'audit' },

  // Security Monitoring
  { name: 'security:read', description: 'View security events, telemetry, and rate limit alerts', category: 'security' },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Starting RBAC Database Initialization...');

    // 1. Seed Permissions
    const permissionMap = {};
    for (const permData of initialPermissions) {
      const perm = await Permission.findOneAndUpdate(
        { name: permData.name },
        permData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      permissionMap[perm.name] = perm._id;
    }
    console.log(`[Seeder] Seeded ${Object.keys(permissionMap).length} Permissions.`);

    // 2. Seed Roles
    const rolesData = [
      {
        name: 'Admin',
        description: 'Super administrator with unrestricted access to all resources and security controls.',
        isSystemRole: true,
        permissions: Object.values(permissionMap),
      },
      {
        name: 'Manager',
        description: 'Team manager with permissions to view team data, update records, and access operational reports.',
        isSystemRole: true,
        permissions: [
          permissionMap['user:read'],
          permissionMap['user:update'],
          permissionMap['role:read'],
          permissionMap['report:read'],
        ],
      },
      {
        name: 'Employee',
        description: 'Standard employee account with self-service profile and authorized resource access.',
        isSystemRole: true,
        permissions: [
          permissionMap['user:read'],
          permissionMap['report:read'],
        ],
      },
      {
        name: 'Guest',
        description: 'Restricted read-only account for external preview.',
        isSystemRole: true,
        permissions: [
          permissionMap['report:read'],
        ],
      },
    ];

    const roleMap = {};
    for (const rData of rolesData) {
      const role = await Role.findOneAndUpdate(
        { name: rData.name },
        rData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      roleMap[role.name] = role._id;
    }
    console.log(`[Seeder] Seeded ${Object.keys(roleMap).length} Roles.`);

    // 3. Seed Default Users
    const salt = await bcrypt.genSalt(10);

    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@security.local',
        passwordHash: await bcrypt.hash('Admin@123456', salt),
        role: roleMap['Admin'],
        isActive: true,
      },
      {
        username: 'manager',
        email: 'manager@security.local',
        passwordHash: await bcrypt.hash('Manager@123456', salt),
        role: roleMap['Manager'],
        isActive: true,
      },
      {
        username: 'employee',
        email: 'employee@security.local',
        passwordHash: await bcrypt.hash('Employee@123456', salt),
        role: roleMap['Employee'],
        isActive: true,
      },
      {
        username: 'guest',
        email: 'guest@security.local',
        passwordHash: await bcrypt.hash('Guest@123456', salt),
        role: roleMap['Guest'],
        isActive: true,
      },
    ];

    for (const uData of defaultUsers) {
      await User.findOneAndUpdate(
        { email: uData.email },
        uData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log('[Seeder] Seeded 4 Default User Accounts (Admin, Manager, Employee, Guest).');

    // 4. Seed Additional Random Users
    const randomUsersData = [
      { username: 'john_doe', email: 'john@example.com', password: 'John@123', roleName: 'Employee' },
      { username: 'jane_smith', email: 'jane@example.com', password: 'Jane@123', roleName: 'Manager' },
      { username: 'bob_admin', email: 'bob@example.com', password: 'Bob@123', roleName: 'Admin' },
      { username: 'alice_guest', email: 'alice@example.com', password: 'Alice@123', roleName: 'Guest' },
      { username: 'charlie_dev', email: 'charlie@example.com', password: 'Charlie@123', roleName: 'Employee' },
      { username: 'diana_lead', email: 'diana@example.com', password: 'Diana@123', roleName: 'Manager' },
      { username: 'eve_sec', email: 'eve@example.com', password: 'Eve@123', roleName: 'Admin' },
      { username: 'frank_viewer', email: 'frank@example.com', password: 'Frank@123', roleName: 'Guest' },
      { username: 'grace_emp', email: 'grace@example.com', password: 'Grace@123', roleName: 'Employee' },
      { username: 'henry_mgr', email: 'henry@example.com', password: 'Henry@123', roleName: 'Manager' },
      { username: 'ivan_dev', email: 'ivan@example.com', password: 'Ivan@123', roleName: 'Employee' },
      { username: 'ivy_lead', email: 'ivy@example.com', password: 'Ivy@123', roleName: 'Manager' },
      { username: 'jack_sec', email: 'jack@example.com', password: 'Jack@123', roleName: 'Admin' },
      { username: 'julia_ops', email: 'julia@example.com', password: 'Julia@123', roleName: 'Admin' },
      { username: 'kevin_view', email: 'kevin@example.com', password: 'Kevin@123', roleName: 'Guest' },
      { username: 'kate_emp', email: 'kate@example.com', password: 'Kate@123', roleName: 'Employee' },
      { username: 'leo_mgr', email: 'leo@example.com', password: 'Leo@123', roleName: 'Manager' },
      { username: 'lily_dev', email: 'lily@example.com', password: 'Lily@123', roleName: 'Employee' },
      { username: 'mike_admin', email: 'mike@example.com', password: 'Mike@123', roleName: 'Admin' },
      { username: 'mia_lead', email: 'mia@example.com', password: 'Mia@123', roleName: 'Manager' },
      { username: 'noah_ops', email: 'noah@example.com', password: 'Noah@123', roleName: 'Employee' },
      { username: 'natalie_sec', email: 'natalie@example.com', password: 'Natalie@123', roleName: 'Admin' },
      { username: 'owen_view', email: 'owen@example.com', password: 'Owen@123', roleName: 'Guest' },
      { username: 'olivia_emp', email: 'olivia@example.com', password: 'Olivia@123', roleName: 'Employee' },
      { username: 'peter_mgr', email: 'peter@example.com', password: 'Peter@123', roleName: 'Manager' },
      { username: 'phoebe_dev', email: 'phoebe@example.com', password: 'Phoebe@123', roleName: 'Employee' },
      { username: 'quinn_sec', email: 'quinn@example.com', password: 'Quinn@123', roleName: 'Admin' },
      { username: 'ruby_lead', email: 'ruby@example.com', password: 'Ruby@123', roleName: 'Manager' },
      { username: 'sam_ops', email: 'sam@example.com', password: 'Sam@123', roleName: 'Employee' },
      { username: 'sophie_view', email: 'sophie@example.com', password: 'Sophie@123', roleName: 'Guest' },
    ];

    for (const uData of randomUsersData) {
      await User.findOneAndUpdate(
        { email: uData.email },
        {
          ...uData,
          role: roleMap[uData.roleName],
          passwordHash: await bcrypt.hash(uData.password, salt),
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[Seeder] Seeded ${randomUsersData.length} Additional Random Users.`);

    console.log('[Seeder] RBAC Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error(`[Seeder Error] ${err.message}`, err);
    process.exit(1);
  }
};

seedDB();
