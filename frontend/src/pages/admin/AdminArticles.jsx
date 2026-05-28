import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", is_pinned: false });

  const fetchArticles = async () => {
    try {
      const res = await API.get("/admin/articles/");
      setArticles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/articles/", formData);
      setShowModal(false);
      setFormData({ title: "", content: "", is_pinned: false });
      fetchArticles();
    } catch (err) {
      alert("Gagal menyimpan artikel");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus artikel ini?")) return;
    try {
      await API.delete(`/admin/articles/${id}/`);
      fetchArticles();
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const handleTogglePin = async (article) => {
    try {
      await API.put(`/admin/articles/${article.id}/`, { ...article, is_pinned: !article.is_pinned });
      fetchArticles();
    } catch (err) {
      alert("Gagal update pin status");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Local Articles Management</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>
          + Add Article
        </button>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "2rem", backgroundColor: "var(--surface)" }}>
            <h3 style={{ marginTop: 0 }}>Add New Article</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Title</label>
                <input required style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-main)" }} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Content</label>
                <textarea required rows="5" style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-main)" }} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.is_pinned} onChange={e => setFormData({...formData, is_pinned: e.target.checked})} />
                  Pin Article
                </label>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-main)" }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {articles.map(article => (
          <div key={article.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", backgroundColor: article.is_pinned ? "rgba(102, 126, 234, 0.05)" : "transparent" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0 }}>{article.title}</h3>
                {article.is_pinned && <span style={{ fontSize: "0.75rem", background: "var(--primary)", color: "white", padding: "0.2rem 0.5rem", borderRadius: "1rem" }}>Pinned</span>}
              </div>
              <p style={{ margin: "0 0 1rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>By {article.author_name} • {new Date(article.created_at).toLocaleDateString()}</p>
              <p style={{ margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.content}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => handleTogglePin(article)} className="btn" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "transparent", border: "1px solid var(--border)", color: "var(--text-main)" }}>
                {article.is_pinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={() => handleDelete(article.id)} className="btn" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "#EF4444", color: "white" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>Belum ada artikel lokal.</p>}
      </div>
    </div>
  );
}
