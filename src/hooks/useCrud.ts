import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

type CrudOptions<T> = {
  table: string;
  idField?: string; // default "id"
};

export function useCrud<T extends Record<string, any>>(
  id: number | null,
  options: CrudOptions<T>
) {
  const { table, idField = "id" } = options;

  const [data, setData] = useState<T | null>(null);
  const [list, setList] = useState<T[]>([]);
  const [form, setForm] = useState<Partial<T> | null>(null);
  const [loading, setLoading] = useState(false);

  // -------------------
  // GET BY ID
  // -------------------
  const loadOne = async () => {
    if (!id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq(idField, id)
      .single();

    if (!error) {
      setData(data);
      setForm(data);
    } else {
      console.error(error);
    }

    setLoading(false);
  };

  // -------------------
  // GET ALL
  // -------------------
  const loadAll = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from(table)
      .select("*");

    if (!error) {
      setList(data || []);
    } else {
      console.error(error);
    }

    setLoading(false);
  };

  // -------------------
  // CREATE
  // -------------------
  const create = async (payload: Partial<T>) => {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    return data;
  };

  // -------------------
  // UPDATE
  // -------------------
  const update = async (payload: Partial<T>) => {
    if (!id) return;

    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq(idField, id);

    if (error) {
      console.error(error);
      return;
    }

    await loadOne();
  };

  // -------------------
  // DELETE
  // -------------------
  const remove = async () => {
    if (!id) return;

    const { error } = await supabase
      .from(table)
      .delete()
      .eq(idField, id);

    if (error) {
      console.error(error);
      return;
    }

    setData(null);
  };

  // -------------------
  // INIT
  // -------------------
  useEffect(() => {
    if (id) loadOne();
  }, [id]);

  return {
    data,
    list,
    form,
    setForm,
    loading,
    loadOne,
    loadAll,
    create,
    update,
    remove,
  };
}