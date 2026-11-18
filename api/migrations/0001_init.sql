PRAGMA foreign_keys = ON;

CREATE TABLE homes (
  id   TEXT NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  CONSTRAINT pk_homes       PRIMARY KEY (id),
  CONSTRAINT chk_homes_name CHECK (length(trim(name)) > 0)
);

CREATE TABLE members (
  id        TEXT    NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  home_id   TEXT    NOT NULL,
  name      TEXT    NOT NULL,
  joined_at INTEGER NOT NULL DEFAULT (unixepoch()),
  CONSTRAINT pk_members      PRIMARY KEY (id),
  CONSTRAINT fk_members_home FOREIGN KEY (home_id) REFERENCES homes (id),
  CONSTRAINT uq_member_name  UNIQUE (home_id, name),
  CONSTRAINT chk_member_name CHECK (length(trim(name)) > 0)
);

CREATE TABLE bills (
  id          TEXT    NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  home_id     TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  total_cents INTEGER NOT NULL,
  CONSTRAINT pk_bills        PRIMARY KEY (id),
  CONSTRAINT fk_bills_home   FOREIGN KEY (home_id) REFERENCES homes (id),
  CONSTRAINT chk_bills_cents CHECK (total_cents > 0),
  CONSTRAINT chk_bills_title CHECK (length(trim(title)) > 0)
);

CREATE TABLE shares (
  id           TEXT    NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  bill_id      TEXT    NOT NULL,
  member_id    TEXT    NOT NULL,
  amount_cents INTEGER NOT NULL,
  paid_at      TEXT,
  CONSTRAINT pk_shares        PRIMARY KEY (id),
  CONSTRAINT fk_shares_bill   FOREIGN KEY (bill_id)   REFERENCES bills (id),
  CONSTRAINT fk_shares_member FOREIGN KEY (member_id) REFERENCES members (id),
  CONSTRAINT uq_shares        UNIQUE (bill_id, member_id),
  CONSTRAINT chk_shares_cents CHECK (amount_cents >= 0)
);

CREATE TABLE idempotency_keys (
  share_id        TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  CONSTRAINT pk_idem       PRIMARY KEY (share_id, idempotency_key),
  CONSTRAINT fk_idem_share FOREIGN KEY (share_id) REFERENCES shares (id)
);
