import { pgTable, text, integer, timestamp, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // Will store hashed passwords
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  last_login: timestamp('last_login'),
  failed_attempts: integer('failed_attempts').notNull().default(0),
  locked_until: timestamp('locked_until')
});

export const products = pgTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  uom: text('uom').notNull(),
  price: real('price').notNull(),
  stock: integer('stock').notNull().default(0),
  restock_level: integer('restock_level').notNull(),
  stock_location: text('stock_location'),
  supplied_by: text('supplied_by'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
}); 