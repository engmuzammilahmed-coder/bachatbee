"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

// Type definition for the form
interface DealForm {
  brand: string;
  title: string;
  discount: string;
  old_price: string;
  new_price: string;
  expires: string;
  category: string;
  deal_url: string;
  featured: boolean;
}

export default function AddDealPage() {
  const [form, setForm] = useState<DealForm>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;

    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;

    setForm({
      ...form,
      [target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!form.brand.trim() || !form.title.trim() || !form.deal_url.trim()) {
      alert("Brand, Title, and Deal URL are required!");
      return;
    }

    // Trim all string inputs
    const sanitizedForm = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
    );

    // Insert into Supabase
    const { error } = await supabase.from("deals").insert([
      {
        ...sanitizedForm,
        verified: true,
        score: 90,
        clicks: 0,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Error adding deal: " + error.message);
    } else {
      alert("Deal added successfully!");
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

        <input
          name="brand"
          placeholder="Brand"
          value={form.brand}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
        />

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
        />

        <input
          name="discount"
          placeholder="Discount (e.g. 40%)"
          value={form.discount}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
        />

        <input
          name="old_price"
          placeholder="Old Price"
          value={form.old_price}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
        />

        <input
          name="new_price"
          placeholder="New Price"
          value={form.new_price}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
        />

        <input
          name="expires"
          placeholder="Expires (e.g. 2 days)"
          value={form.expires}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
        />

        <select
          name="category"
          value={form.category}
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
          value={form.deal_url}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
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