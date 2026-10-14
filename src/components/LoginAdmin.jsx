import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginAdmin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState("");
  const [memproses, setMemproses] = useState(false);

  // LOGIN ADMIN MANAGEMENT RT03
  const handleLogin = async (e) => {
    e.preventDefault();
    setMemproses(true);
    setPesan("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const { data: statusAdmin, error: errorAdmin } =
        await supabase.rpc("is_admin_rt03");

      if (errorAdmin) throw errorAdmin;

      if (statusAdmin !== true) {
        await supabase.auth.signOut();
        throw new Error(
          "Akun ini tidak terdaftar sebagai Admin RT."
        );
      }

      onLoginSuccess(data.session);
    } catch (error) {
      setPesan(error.message || "Login gagal. Silakan coba kembali.");
    } finally {
      setMemproses(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.logo}>RT</div>

        <h2 style={styles.title}>Management RT</h2>
        <p style={styles.subtitle}>RT 03 / RW 07 · Karet Setiabudi</p>

        <label style={styles.label}>Email Admin</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email admin"
          autoComplete="username"
          required
          style={styles.input}
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
          autoComplete="current-password"
          required
          style={styles.input}
        />

        {pesan && <p role="alert" style={styles.error}>{pesan}</p>}

        <button type="submit" disabled={memproses} style={styles.button}>
          {memproses ? "Memeriksa akun..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "#f1f5f9",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    width: "100%",
    maxWidth: 390,
    boxSizing: "border-box",
    padding: 32,
    borderRadius: 16,
    background: "#ffffff",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  logo: {
    width: 56,
    height: 56,
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    background: "#1d4ed8",
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },
  title: {
    margin: 0,
    textAlign: "center",
    color: "#1e293b",
  },
  subtitle: {
    margin: "8px 0 28px",
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },
  label: {
    display: "block",
    marginBottom: 7,
    color: "#334155",
    fontSize: 14,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    marginBottom: 18,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 15,
  },
  button: {
    width: "100%",
    padding: 13,
    border: "none",
    borderRadius: 8,
    background: "#1d4ed8",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    color: "#b91c1c",
    fontSize: 13,
    marginBottom: 16,
  },
};