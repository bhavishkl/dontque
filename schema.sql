[
  {
    "table_name": "app_feedback",
    "ordinal_position": 1,
    "column_name": "feedback_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "app_feedback",
    "ordinal_position": 2,
    "column_name": "user_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "app_feedback",
    "ordinal_position": 3,
    "column_name": "rating",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "app_feedback",
    "ordinal_position": 4,
    "column_name": "feedback_text",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "app_feedback",
    "ordinal_position": 5,
    "column_name": "user_role",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "app_feedback",
    "ordinal_position": 6,
    "column_name": "user_name",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "app_feedback",
    "ordinal_position": 7,
    "column_name": "user_image",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "app_feedback",
    "ordinal_position": 8,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "app_feedback",
    "ordinal_position": 9,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "business_info",
    "ordinal_position": 1,
    "column_name": "business_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "business_info",
    "ordinal_position": 2,
    "column_name": "owner_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 3,
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 4,
    "column_name": "business_type",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 5,
    "column_name": "category",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 6,
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 7,
    "column_name": "address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 8,
    "column_name": "city",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 9,
    "column_name": "pincode",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 10,
    "column_name": "phone",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 11,
    "column_name": "email",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 12,
    "column_name": "gst_number",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 13,
    "column_name": "pan_number",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 14,
    "column_name": "fssai_number",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "business_info",
    "ordinal_position": 15,
    "column_name": "status",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'active'::character varying"
  },
  {
    "table_name": "business_info",
    "ordinal_position": 16,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "business_info",
    "ordinal_position": 17,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "counters",
    "ordinal_position": 1,
    "column_name": "counter_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "counters",
    "ordinal_position": 2,
    "column_name": "queue_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "counters",
    "ordinal_position": 3,
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "counters",
    "ordinal_position": 4,
    "column_name": "counter_type",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'standard'::character varying"
  },
  {
    "table_name": "counters",
    "ordinal_position": 5,
    "column_name": "status",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'active'::character varying"
  },
  {
    "table_name": "counters",
    "ordinal_position": 6,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "counters",
    "ordinal_position": 7,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "counters",
    "ordinal_position": 8,
    "column_name": "service_start_time",
    "data_type": "time without time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "counters",
    "ordinal_position": 9,
    "column_name": "next_serve_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "counters",
    "ordinal_position": 10,
    "column_name": "max_capacity",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries",
    "ordinal_position": 1,
    "column_name": "entry_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "queue_entries",
    "ordinal_position": 2,
    "column_name": "queue_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries",
    "ordinal_position": 3,
    "column_name": "user_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries",
    "ordinal_position": 4,
    "column_name": "position",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries",
    "ordinal_position": 5,
    "column_name": "join_time",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "queue_entries",
    "ordinal_position": 6,
    "column_name": "status",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'waiting'::character varying"
  },
  {
    "table_name": "queue_entries",
    "ordinal_position": 7,
    "column_name": "added_by",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries",
    "ordinal_position": 8,
    "column_name": "counter_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries",
    "ordinal_position": 9,
    "column_name": "entry_type",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'standard'::character varying"
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 1,
    "column_name": "queue_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 2,
    "column_name": "user_id",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 3,
    "column_name": "status",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 4,
    "column_name": "actual_wait_time",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 5,
    "column_name": "join_time",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 6,
    "column_name": "serve_time",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 7,
    "column_name": "leave_time",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 8,
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 9,
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 10,
    "column_name": "left_position",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 11,
    "column_name": "added_by",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 12,
    "column_name": "wait_time",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 13,
    "column_name": "entry_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 14,
    "column_name": "counter_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 15,
    "column_name": "services",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  },
  {
    "table_name": "queue_entries_archive",
    "ordinal_position": 16,
    "column_name": "rating",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queue_entry_services",
    "ordinal_position": 1,
    "column_name": "entry_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "queue_entry_services",
    "ordinal_position": 2,
    "column_name": "service_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "queue_entry_services",
    "ordinal_position": 3,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "queues",
    "ordinal_position": 1,
    "column_name": "queue_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 2,
    "column_name": "owner_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 3,
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 4,
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 5,
    "column_name": "category",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 6,
    "column_name": "location",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 7,
    "column_name": "max_capacity",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 8,
    "column_name": "current_queue",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_name": "queues",
    "ordinal_position": 9,
    "column_name": "estimated_wait_time",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 10,
    "column_name": "avg_wait_time",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 11,
    "column_name": "total_served",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_name": "queues",
    "ordinal_position": 12,
    "column_name": "status",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'active'::character varying"
  },
  {
    "table_name": "queues",
    "ordinal_position": 13,
    "column_name": "opening_time",
    "data_type": "time without time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 14,
    "column_name": "closing_time",
    "data_type": "time without time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 15,
    "column_name": "image_url",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 16,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "queues",
    "ordinal_position": 17,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "queues",
    "ordinal_position": 18,
    "column_name": "est_time_to_serve",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": "0"
  },
  {
    "table_name": "queues",
    "ordinal_position": 19,
    "column_name": "service_start_time",
    "data_type": "time without time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 20,
    "column_name": "short_id",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": "(floor(((random() * (((999999 - 100000) + 1))::double precision) + (100000)::double precision)))::bigint"
  },
  {
    "table_name": "queues",
    "ordinal_position": 21,
    "column_name": "service_type",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 22,
    "column_name": "next_serve_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 23,
    "column_name": "total_est_wait_time",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_name": "queues",
    "ordinal_position": 24,
    "column_name": "address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "queues",
    "ordinal_position": 25,
    "column_name": "delayed_until",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "saved_queues",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": "nextval('saved_queues_id_seq'::regclass)"
  },
  {
    "table_name": "saved_queues",
    "ordinal_position": 2,
    "column_name": "user_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "saved_queues",
    "ordinal_position": 3,
    "column_name": "queue_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "saved_queues",
    "ordinal_position": 4,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "CURRENT_TIMESTAMP"
  },
  {
    "table_name": "services",
    "ordinal_position": 1,
    "column_name": "service_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "services",
    "ordinal_position": 2,
    "column_name": "counter_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "services",
    "ordinal_position": 3,
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "services",
    "ordinal_position": 4,
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "services",
    "ordinal_position": 5,
    "column_name": "estimated_time",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "services",
    "ordinal_position": 6,
    "column_name": "price",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "services",
    "ordinal_position": 7,
    "column_name": "status",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'active'::character varying"
  }
]