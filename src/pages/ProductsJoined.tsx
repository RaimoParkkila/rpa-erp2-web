import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

type Product = {
  id: number;
  productname: string;
  brand: string;
  model: string;
  price: number;
  rpa_shop_product_group_id: number | null;
};

type ProductGroup = {
  id: number;
  productgroupname: string;
};

type ProductView = Product & {
  group_name: string;
};

export default function ProductsJoined() {
  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data: productsData, error: pError } = await supabase
      .from("rpa_shop_product")
      .select("*");

    const { data: groupsData, error: gError } = await supabase
      .from("rpa_shop_product_group")
      .select("*");

    if (pError || gError) {
      console.error(pError || gError);
      setLoading(false);
      return;
    }

    const joined = (productsData || []).map((p: any) => {
      const group = (groupsData || []).find(
        (g: any) => g.id === p.rpa_shop_product_group_id
      );

      return {
        ...p,
        group_name: group?.productgroupname || "-",
      };
    });

    setProducts(joined);
    setLoading(false);
  }

  return (
    <div>
      <h1>Products (JOIN → Product Group)</h1>

      {loading && <p>Loading...</p>}

      {!loading && (
        <table border={1} cellPadding={8} style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Price</th>
              <th>Group</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.productname}</td>
                <td>{p.brand}</td>
                <td>{p.model}</td>
                <td>{p.price}</td>
                <td>{p.group_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}