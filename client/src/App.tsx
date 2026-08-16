import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  async function handleCheck() {
    setState("loading");
    setErrorMessage("");
    try {
      const res = await checkSystem();
      setCategories(res.categories);
      setState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to connect to TokTickIT API");
      setState("error");
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-4">
        TokTickIT <span className="text-success">IT Service Desk</span>
      </h1>

      <button className="btn btn-success" onClick={handleCheck} disabled={state === "loading"}>
        {state === "loading" ? "Loading…" : "Check System"}
      </button>

      {state === "loading" && (
        <div className="mt-4 text-muted">
          <em>Loading…</em>
        </div>
      )}

      {state === "success" && (
        <div className="mt-4">
          <p className="mb-2"><strong>System Status:</strong> <span className="text-success">Online</span></p>
          {categories.length > 0 && (
            <div className="mt-3">
              <h2 className="h6 mb-2">Supported Request Categories:</h2>
              <ul className="list-unstyled ps-2">
                {categories.map((c) => (
                  <li key={c.id}>• {c.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {state === "error" && (
        <div className="mt-4">
          <p className="mb-2"><strong>System Status:</strong> <span className="text-danger">Offline</span></p>
          <div className="alert alert-danger py-2" role="alert">
            {errorMessage || "Unable to connect to TokTickIT API"}
          </div>
        </div>
      )}
    </div>
  );
}
