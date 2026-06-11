import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

/**
 * Tenant helper (voit myöhemmin siirtää Contextiin)
 */
function getTenantId(): string | null {
  return localStorage.getItem("tenant_id");
}

/**
 * Domain → table mapping
 */
type DomainTables = {
  customers: "rpa_customer";
  products: "rpa_shop_product";
  invoices: "rpaheaderofinvoice";
  invoice_lines: "rpa_invoice_line";
  storage: "rpa_storagebranchoffice";
  wholesale: "rpa_wholesale";
};

type DomainName = keyof DomainTables;

type CrudOptions = {
  domain: DomainName;
  idField?: string;
  enableTenant?: boolean;
};

export function useCrud<T extends Record<string, any>>(
  options: CrudOptions
) {
  const { domain, idField = "id", enableTenant = true } = options;

  const tenantId = getTenantId();

  const table = ((): DomainTables[DomainName] => {
    const map: DomainTables = {
      customers: "rpa_customer",
      products: "rpa_shop_product",
      invoices: "rpaheaderofinvoice",
      invoice_lines: "rpa_invoice_line",
      storage: "rpa_storagebranchoffice",
      wholesale: "rpa_wholesale",
    };

    return map[domain];
  })();

  const [data, setData] = useState<T | null>(null);
  const [list, setList] = useState<T[]>([]);
  const [form, setForm] = useState<Partial<T> | null>(null);
  const [loading, setLoading] = useState(false);

  // -------------------
  // GET ONE
  // -------------------
  const getById = async (id: number) => {
    setLoading(true);

    let query = supabase
      .from(table)
      .select("*")
      .eq(idField, id);

    if (enableTenant && tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error("getById error:", error);
      setLoading(false);
      return;
    }

    setData(data);
    setForm(data);

    setLoading(false);
  };

  // -------------------
  // GET ALL
  // -------------------
  const getAll = async () => {
    setLoading(true);

    let query = supabase.from(table).select("*");

    if (enableTenant && tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("getAll error:", error);
      setLoading(false);
      return;
    }

    setList(data || []);
    setLoading(false);
  };

  // -------------------
  // CREATE
  // -------------------
  const create = async (payload: Partial<T>) => {
    const safePayload = enableTenant
      ? { ...payload, tenant_id: tenantId }
      : payload;

    const { data, error } = await supabase
      .from(table)
      .insert(safePayload)
      .select()
      .single();

    if (error) {
      console.error("create error:", error);
      return null;
    }

    return data;
  };

  // -------------------
  // UPDATE
  // -------------------
  const update = async (id: number, payload: Partial<T>) => {
    let query = supabase
      .from(table)
      .update(payload)
      .eq(idField, id);

    if (enableTenant && tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { error } = await query;

    if (error) {
      console.error("update error:", error);
      return;
    }

    await getById(id);
  };

  // -------------------
  // DELETE
  // -------------------
  const remove = async (id: number) => {
    let query = supabase
      .from(table)
      .delete()
      .eq(idField, id);

    if (enableTenant && tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { error } = await query;

    if (error) {
      console.error("delete error:", error);
      return;
    }

    setData(null);
    setForm(null);
  };

  // -------------------
  // INIT CHECK
  // -------------------
  useEffect(() => {
    if (enableTenant && !tenantId) {
      console.warn("tenant_id missing");
    }
  }, []);

  return {
    data,
    list,
    form,
    setForm,
    loading,
    getById,
    getAll,
    create,
    update,
    remove,
  };
}