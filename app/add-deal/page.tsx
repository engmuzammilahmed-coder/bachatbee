"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddDealPage() {
  const [form, setForm] = useState({
    brand: "",
    title: "",
    discount: "",
    old_price: "",
    new_price: "",
    expires: "",
    category: "",
    deal_url: "",
    featured: false,
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { error } = await supabase.from("deals").insert([
      {
        ...form,
        verified: true,
        score: 90,
        clicks: 0,
      },
    ]);

    if (error) {
      alert(error.message);
console.log(error);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold">Add New Deal 🐝</h2>

        <input name="brand" placeholder="Brand" onChange={handleChange} className="w-full p-3 border rounded-xl" />
        <input name="title" placeholder="Title" onChange={handleChange} className="w-full p-3 border rounded-xl" />
        <input name="discount" placeholder="Discount (e.g. 40%)" onChange={handleChange} className="w-full p-3 border rounded-xl" />
        <input name="old_price" placeholder="Old Price" onChange={handleChange} className="w-full p-3 border rounded-xl" />
        <input name="new_price" placeholder="New Price" onChange={handleChange} className="w-full p-3 border rounded-xl" />
        <input name="expires" placeholder="Expires (e.g. 2 days)" onChange={handleChange} className="w-full p-3 border rounded-xl" />

<select
  name="category"
  onChange={handleChange}
  className="w-full p-3 border rounded-xl"
>
  <option value="">Select category</option>
  <option value="Fashion">Fashion</option>
  <option value="Electronics">Electronics</option>
  <option value="Marketplace">Marketplace</option>
  <option value="Food">Food</option>
</select>
<input
  name="deal_url"
  placeholder="Deal Link / Brand URL"
  onChange={handleChange}
  className="w-full p-3 border rounded-xl"
/><label className="flex items-center gap-2 text-sm">
  <input
    type="checkbox"
    name="featured"
    onChange={(e) =>
      setForm({ ...form, featured: e.target.checked })
    }
  />
  Mark as Featured ⭐
</label>
        <button className="w-full bg-black text-white py-3 rounded-xl font-bold">
          Add Deal
        </button>
      </form>
    </div>
  );
}