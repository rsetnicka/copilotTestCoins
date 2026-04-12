import {
  pgTable,
  uuid,
  text,
  integer,
  pgEnum,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const coinTypeEnum = pgEnum("coin_type", [
  "standard",
  "commemorative",
]);

export const coins = pgTable("coins", {
  id: uuid("id").defaultRandom().primaryKey(),
  country: text("country").notNull(),
  countryCode: text("country_code").notNull(),
  year: integer("year").notNull(),
  type: coinTypeEnum("type").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const userCollections = pgTable(
  "user_collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    coinId: uuid("coin_id")
      .notNull()
      .references(() => coins.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("user_coin_unique").on(table.userId, table.coinId)]
);

/** Personal coins created by a user; never visible to other users. */
export const userCustomCoins = pgTable("user_custom_coins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  country: text("country").notNull(),
  countryCode: text("country_code").notNull(),
  year: integer("year"),
  /** Path inside the `custom-coins` storage bucket, e.g. `{userId}/{id}.webp` */
  imagePath: text("image_path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Coin = typeof coins.$inferSelect;
export type UserCollection = typeof userCollections.$inferSelect;
export type UserCustomCoin = typeof userCustomCoins.$inferSelect;
