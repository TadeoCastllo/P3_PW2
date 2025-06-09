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
     <main className="relative min-h-screen flex items-center justify-center bg-black">
      {/* Imagen de fondo global + overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://raw.githubusercontent.com/Zaeinmd/img/main/FondoLogin.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-black opacity-70 z-10" /> {/* capa oscura */}

      {/* Contenedor con segunda imagen de fondo + borde negro grueso */}
      <div
        className="relative z-20 rounded-xl p-1 bg-black shadow-2xl w-full max-w-md"
        style={{ border: '8px solid #102820' }} // margen grueso verde oscuro
      >
        {/* Fondo con segunda imagen dentro del contenedor */}
        <div
          className="rounded-lg p-8"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <h1 className="text-3xl font-bold mb-6 text-center text-green-400">
            Iniciar sesión
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="bg-gray-900 text-green-400 border border-green-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-500"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="bg-gray-900 text-green-400 border border-green-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-500"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-lg transition"
            >
              Entrar
            </button>
          </form>

          {mensaje && (
            <p className="mt-4 text-center text-sm text-green-300 font-medium">
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}