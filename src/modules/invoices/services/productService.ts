import { supabase } from "@services/supabase";

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from("rpa_shop_product")
      .select("id, productname, price");

    if (error) {
      console.error(error);
      return [];
    }

    return data || [];
  },
};