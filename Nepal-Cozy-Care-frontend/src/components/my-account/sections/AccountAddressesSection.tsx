import type { FormEvent } from "react";
import { MapPin } from "lucide-react";
import AccountNotice from "../AccountNotice";
import type { AddressEntry, AddressForm, Notice } from "../types";

type AccountAddressesSectionProps = {
  notice: Notice | null;
  editingAddressId: string | null;
  addressForm: AddressForm;
  addresses: AddressEntry[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChangeAddressField: (field: keyof AddressForm, value: string) => void;
  onCancelEdit: () => void;
  onSetDefaultAddress: (addressId: string) => void;
  onEditAddress: (address: AddressEntry) => void;
  onDeleteAddress: (addressId: string) => void;
};

export default function AccountAddressesSection({
  notice,
  editingAddressId,
  addressForm,
  addresses,
  onSubmit,
  onChangeAddressField,
  onCancelEdit,
  onSetDefaultAddress,
  onEditAddress,
  onDeleteAddress,
}: AccountAddressesSectionProps) {
  return (
    <div className="account-section-stack">
      <AccountNotice notice={notice} />

      <div className="account-address-layout">
        <section className="account-card">
          <div className="account-card-head">
            <h3>{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
          </div>

          <form className="account-form" onSubmit={onSubmit}>
            <label className="account-form-field">
              <span>Label</span>
              <input
                type="text"
                value={addressForm.label}
                onChange={(event) => onChangeAddressField("label", event.target.value)}
                placeholder="Home, Office, Gift Delivery"
              />
            </label>

            <label className="account-form-field">
              <span>Full address</span>
              <textarea
                value={addressForm.address}
                onChange={(event) => onChangeAddressField("address", event.target.value)}
                placeholder="Ward, street, city, landmark"
                rows={4}
              />
            </label>

            <label className="account-form-field">
              <span>Delivery note</span>
              <input
                type="text"
                value={addressForm.note}
                onChange={(event) => onChangeAddressField("note", event.target.value)}
                placeholder="Gate code, office hours, recipient phone"
              />
            </label>

            <div className="account-form-actions">
              <button type="submit" className="account-primary-btn">
                {editingAddressId ? "Update Address" : "Save Address"}
              </button>
              {editingAddressId && (
                <button type="button" className="account-secondary-btn" onClick={onCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="account-card">
          <div className="account-card-head">
            <h3>Saved Addresses</h3>
          </div>

          {addresses.length === 0 ? (
            <div className="account-empty-state">
              <MapPin size={24} />
              <p>No saved addresses yet.</p>
            </div>
          ) : (
            <div className="account-list-stack">
              {addresses.map((address) => (
                <article key={address.id} className="account-list-card">
                  <div className="account-list-main">
                    <div>
                      <p className="account-item-title">
                        {address.label}
                        {address.isDefault ? " | Default" : ""}
                      </p>
                      <p className="account-item-meta">{address.address}</p>
                    </div>
                  </div>

                  {address.note && <p className="account-item-note">{address.note}</p>}

                  <div className="account-list-actions">
                    {!address.isDefault && (
                      <button
                        type="button"
                        className="account-link-btn"
                        onClick={() => onSetDefaultAddress(address.id)}
                      >
                        Set default
                      </button>
                    )}
                    <button
                      type="button"
                      className="account-link-btn"
                      onClick={() => onEditAddress(address)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="account-link-btn danger"
                      onClick={() => onDeleteAddress(address.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
