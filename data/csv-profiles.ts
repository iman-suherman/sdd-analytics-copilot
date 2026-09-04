/**
 * Per-company CSV column layouts (business vocabulary) mapped to canonical SQLite columns.
 * Sample files live under data/samples/{companyId}/.
 */
export type CanonicalTable = "customers" | "products" | "orders" | "order_items";

export type ColumnMap = Record<string, string>; // csvHeader → sqliteColumn

export type CompanyCsvProfile = {
  companyId: string;
  label: string;
  files: Record<CanonicalTable, { filename: string; columns: ColumnMap }>;
};

const marketplaceLike = (companyId: string, label: string): CompanyCsvProfile => ({
  companyId,
  label,
  files: {
    customers: {
      filename: "sellers.csv",
      columns: {
        seller_id: "id",
        company_id: "company_id",
        seller_name: "name",
        seller_tier: "segment",
        region: "region",
        onboarded_at: "created_at",
      },
    },
    products: {
      filename: "listings.csv",
      columns: {
        sku: "id",
        company_id: "company_id",
        listing_title: "name",
        category: "category",
        list_price_idr: "price",
      },
    },
    orders: {
      filename: "orders.csv",
      columns: {
        order_id: "id",
        company_id: "company_id",
        seller_id: "customer_id",
        order_date: "order_date",
        fulfillment_status: "status",
        gmv_idr: "net_amount",
      },
    },
    order_items: {
      filename: "order_lines.csv",
      columns: {
        line_id: "id",
        company_id: "company_id",
        order_id: "order_id",
        sku: "product_id",
        units: "quantity",
        line_gmv_idr: "amount",
      },
    },
  },
});

export const COMPANY_CSV_PROFILES: Record<string, CompanyCsvProfile> = {
  tokoraya: marketplaceLike("tokoraya", "Marketplace — penjual & listing"),
  bukadagang: marketplaceLike("bukadagang", "Marketplace UMKM — mitra dagang"),
  belinusa: marketplaceLike("belinusa", "E-commerce — katalog keluarga"),
  gocepat: {
    companyId: "gocepat",
    label: "On-demand — mitra & layanan",
    files: {
      customers: {
        filename: "partners.csv",
        columns: {
          partner_id: "id",
          company_id: "company_id",
          partner_name: "name",
          partner_type: "segment",
          service_city_region: "region",
          joined_at: "created_at",
        },
      },
      products: {
        filename: "services.csv",
        columns: {
          service_id: "id",
          company_id: "company_id",
          service_name: "name",
          service_category: "category",
          base_fare_idr: "price",
        },
      },
      orders: {
        filename: "bookings.csv",
        columns: {
          booking_id: "id",
          company_id: "company_id",
          partner_id: "customer_id",
          booked_at: "order_date",
          booking_status: "status",
          fare_idr: "net_amount",
        },
      },
      order_items: {
        filename: "booking_legs.csv",
        columns: {
          leg_id: "id",
          company_id: "company_id",
          booking_id: "order_id",
          service_id: "product_id",
          qty: "quantity",
          fare_component_idr: "amount",
        },
      },
    },
  },
  jelajahid: {
    companyId: "jelajahid",
    label: "Travel — wisatawan & paket",
    files: {
      customers: {
        filename: "travelers.csv",
        columns: {
          traveler_id: "id",
          company_id: "company_id",
          traveler_name: "name",
          traveler_segment: "segment",
          origin_region: "region",
          member_since: "created_at",
        },
      },
      products: {
        filename: "packages.csv",
        columns: {
          package_id: "id",
          company_id: "company_id",
          package_name: "name",
          travel_category: "category",
          package_price_idr: "price",
        },
      },
      orders: {
        filename: "trip_bookings.csv",
        columns: {
          booking_id: "id",
          company_id: "company_id",
          traveler_id: "customer_id",
          travel_date: "order_date",
          booking_status: "status",
          booking_value_idr: "net_amount",
        },
      },
      order_items: {
        filename: "trip_lines.csv",
        columns: {
          stay_line_id: "id",
          company_id: "company_id",
          booking_id: "order_id",
          package_id: "product_id",
          guests: "quantity",
          line_amount_idr: "amount",
        },
      },
    },
  },
  angkutprima: {
    companyId: "angkutprima",
    label: "Logistik — pengirim & kiriman",
    files: {
      customers: {
        filename: "shippers.csv",
        columns: {
          shipper_id: "id",
          company_id: "company_id",
          shipper_name: "name",
          shipper_segment: "segment",
          origin_hub: "region",
          contract_start: "created_at",
        },
      },
      products: {
        filename: "cargo_services.csv",
        columns: {
          service_sku: "id",
          company_id: "company_id",
          service_name: "name",
          cargo_type: "category",
          rate_idr: "price",
        },
      },
      orders: {
        filename: "shipments.csv",
        columns: {
          shipment_id: "id",
          company_id: "company_id",
          shipper_id: "customer_id",
          ship_date: "order_date",
          shipment_status: "status",
          revenue_idr: "net_amount",
        },
      },
      order_items: {
        filename: "parcels.csv",
        columns: {
          parcel_id: "id",
          company_id: "company_id",
          shipment_id: "order_id",
          service_sku: "product_id",
          parcels: "quantity",
          charge_idr: "amount",
        },
      },
    },
  },
};

export const CANONICAL_COLUMNS: Record<CanonicalTable, string[]> = {
  customers: ["id", "company_id", "name", "segment", "region", "created_at"],
  products: ["id", "company_id", "name", "category", "price"],
  orders: ["id", "company_id", "customer_id", "order_date", "status", "net_amount"],
  order_items: ["id", "company_id", "order_id", "product_id", "quantity", "amount"],
};
