"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const response = await fetch(
      "http://localhost:8000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    localStorage.setItem(
      "token",
      data.access_token
    );

    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-20 flex max-w-md flex-col gap-4"
    >
      <input
        placeholder="Firstname"
        className="border p-3"
        onChange={(e) =>
          setForm({
            ...form,
            firstname:
              e.target.value,
          })
        }
      />

      <input
        placeholder="Lastname"
        className="border p-3"
        onChange={(e) =>
          setForm({
            ...form,
            lastname:
              e.target.value,
          })
        }
      />

      <input
        placeholder="Email"
        className="border p-3"
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-3"
        onChange={(e) =>
          setForm({
            ...form,
            password:
              e.target.value,
          })
        }
      />

      <button
        className="rounded bg-black p-3 text-white"
      >
        Register
      </button>
    </form>
  );
}