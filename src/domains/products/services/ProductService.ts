import { supabase } from "@services/supabase";

export type Product = {
  id: number;
  productname: string;
  brand: string;
  model: string;
  price: number;
  status?: string | null;
  image_url?: string | null;
};

export const ProductService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("rpa_shop_product")
      .select(
        "id, productname, brand, model, price, status, image_url"
      );

    if (error) {
      console.error(error);
      throw error;
    }

    return (data as Product[]) || [];
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from("rpa_shop_product")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      throw error;
    }
  },
};