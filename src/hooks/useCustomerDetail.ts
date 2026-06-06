import { useEffect, useState } from "react";
import {
  getCustomerById,
  updateCustomer,
  createInvoice,
  getDefaultProduct,
  createInvoiceLine,
} from "../services/customerService";

type Customer = {
  id: number;
  firstname: string;
  email: string;
  city: string;
  country: string;
  phone1: string;
};

export function useCustomerDetail(customerId: number) {
  const [data, setData] = useState<Customer | null>(null);
  const [form, setForm] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // -------------------
  // LOAD
  // -------------------
  const load = async () => {
    setLoading(true);

    // CUSTOMER
    const { data: customerData } = await getCustomerById(customerId);
    if (customerData) {
      setData(customerData);
      setForm(customerData);
    }

    // INVOICES (SUORA TAULU)
    const { data: invoiceData, error } = await import("../services/supabase")
      .then(({ supabase }) =>
        supabase
          .from("rpaheaderofinvoice")
          .select("*")
          .eq("rpa_customer_id", customerId)
          .order("date", { ascending: false })
      );

    if (!error) {
      setInvoices(invoiceData || []);
    }

    setLoading(false);
  };

  // -------------------
  // SAVE CUSTOMER
  // -------------------
  const save = async () => {
    if (!form) return;

    const { error } = await updateCustomer(customerId, {
      firstname: form.firstname,
      email: form.email,
      city: form.city,
      country: form.country,
      phone1: form.phone1,
    });

    if (!error) {
      load();
    }
  };

  // -------------------
  // CREATE INVOICE
  // -------------------
  const handleCreateInvoice = async () => {
    const { data: invoice } = await createInvoice(customerId);
    if (!invoice) return;

    window.location.href = `/invoices/${invoice.id}`;
  };

  // -------------------
  // QUICK INVOICE
  // -------------------
  const handleQuickInvoice = async () => {
    const { data: invoice } = await createInvoice(customerId);
    if (!invoice) return;

    const { data: product } = await getDefaultProduct();
    if (!product) return;

    await createInvoiceLine({
      rpa_headerofinvoice_id: invoice.id,
      rpa_shop_product_id: product.id,
      productname: product.productname,
      price: product.price,
      amount: 1,
    });

    window.location.href = `/invoices/${invoice.id}`;
  };

  // -------------------
  // INIT
  // -------------------
  useEffect(() => {
    if (customerId) load();
  }, [customerId]);

  return {
    data,
    form,
    setForm,
    invoices,
    loading,
    save,
    handleCreateInvoice,
    handleQuickInvoice,
  };
}