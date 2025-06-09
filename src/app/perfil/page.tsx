"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Perfil() {
  const [usuario, setUsuario] = useState<any>(null);
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  useEffect(() => {
    const correo = localStorage.getItem("correo");
    const contrasena = localStorage.getItem("contrasena");
    if (!correo || !contrasena) {
      router.push("/dashboard");
      return;
    }

    fetch("http://localhost:8000/usuario/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${encodeURIComponent(correo)}&password=${encodeURIComponent(contrasena)}`
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUsuario(data);
          if (data.rol === "estudiante") {
            router.push("/examenes");
          }
        } else {
          setMensaje("No autorizado");
        }
      })
      .catch(() => setMensaje("Error de conexión"));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("correo");
    localStorage.removeItem("contrasena");
    router.push("/dashboard");
  };

  if (mensaje) return <p>{mensaje}</p>;
  if (!usuario) return <p>Cargando...</p>;

  if (usuario.rol === "profesor") {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Panel del Profesor</h1>
        <p>Aquí se mostrará la calificación más alta de cada alumno.</p>
        <button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-2 rounded">
          Cerrar sesión
        </button>
      </main>
    );
  }

  // Si es estudiante, ya fue redirigido a /examenes
  return null;
}