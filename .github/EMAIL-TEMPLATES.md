# Branded transaction email

The backend keeps editable plain-text subjects and bodies. Default English and
Chinese copy now uses a greeting, a short status explanation, order details,
an order URL and a privacy reminder. Chinese expiry notices no longer fall back
to English.

Reconciliation upgrades only records whose subject AND body exactly match the
legacy defaults. Customized records remain intact. New installations use the
new copy. Existing admin template views reconcile on load.

Messages without explicit HTML receive an escaped, table-based HTML envelope
before encrypted queue storage: pale background, white card, green accent,
configured store name and a link to the configured public origin. Inline styles
and system fonts avoid external assets. Plain-text delivery remains available;
explicit HTML from an existing caller is preserved. Authentication notifications
also use this envelope when they previously supplied only text.

Checks cover markup escaping, link/verification-token preservation, safe origin
handling, custom-template preservation and existing delivery/encryption tests.
No real provider smoke email is sent automatically. Browser previews cannot
guarantee pixel-identical output across Outlook, Gmail and other email clients.
