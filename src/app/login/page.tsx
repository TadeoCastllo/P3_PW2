"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("Cargando...");
    const formData = new URLSearchParams();
    formData.append("username", correo);
    formData.append("password", contrasena);

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("correo", correo);
      localStorage.setItem("contrasena", contrasena);
      localStorage.setItem("estudiante_id", data.id); // <--- Guarda el id real
      setMensaje("¡Inicio de sesión exitoso!");
      router.push("/perfil");
    } else {
      const data = await res.json();
      setMensaje(data.detail || "Error al iniciar sesión");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-80">
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Entrar
        </button>
      </form>
      {mensaje && <p className="mt-4">{mensaje}</p>}
    </main>
  );
}