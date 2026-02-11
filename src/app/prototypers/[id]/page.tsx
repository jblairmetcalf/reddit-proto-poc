"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/infrastructure/Toast";
import { Dialog, ConfirmDialog, StatusBadge, PROTOTYPE_STATUS_STYLES, ROLE_STYLES } from "@/components/infrastructure";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { VARIANT_PRESETS } from "@/lib/variants";

interface Prototyper {
  name: string;
  role: string;
  email: string;
}

interface Prototype {
  id: string;
  title: string;
  description: string;
  status: "draft" | "in-progress" | "complete";
  variant: string;
  url: string;
  fileName: string;
  fileUrl: string;
  modifiedAt?: { seconds: number };
  createdAt?: { seconds: number };
}

export default function PrototyperDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [prototyper, setPrototyper] = useState<Prototyper | null>(null);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "in-progress" | "complete">("draft");
  const [protoType, setProtoType] = useState<"default" | "link" | "file">("file");
  const [variant, setVariant] = useState("default");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileRef, setFileRef] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<{ message: string; action: () => void } | null>(null);
  const [showEditPrototyper, setShowEditPrototyper] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingPrototyper, setSavingPrototyper] = useState(false);
  const [origPrototyper, setOrigPrototyper] = useState({ name: "", role: "", email: "" });

  // Listen to prototyper doc
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "prototypers", id),
      (snap) => {
        if (snap.exists()) {
          setPrototyper(snap.data() as Prototyper);
        }
      },
      (err) => console.error("Prototyper doc snapshot error:", err)
    );
    return () => unsub();
  }, [id]);

  // Listen to prototypes sub-collection
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "prototypers", id, "prototypes"),
      (snap) => {
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Prototype, "id">),
        }));
        docs.sort((a, b) => (b.modifiedAt?.seconds ?? b.createdAt?.seconds ?? 0) - (a.modifiedAt?.seconds ?? a.createdAt?.seconds ?? 0));
        setPrototypes(docs);
      }
    );
    return () => unsub();
  }, [id]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("draft");
    setProtoType("file");
    setVariant("default");
    setUrl("");
    setFileName("");
    setFileRef(null);
    setUploadProgress(null);
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  const [origProto, setOrigProto] = useState({ title: "", description: "", status: "", protoType: "", variant: "", url: "", fileName: "" });
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null);

  const editHasChanges = editingId != null && (fileRef != null || title !== origProto.title || description !== origProto.description || status !== origProto.status || protoType !== origProto.protoType || variant !== origProto.variant || url !== origProto.url || fileName !== origProto.fileName);

  const prototyperHasChanges = editName !== origPrototyper.name || editRole !== origPrototyper.role || editEmail !== origPrototyper.email;

  const confirmCloseForm = () => {
    if (editingId && editHasChanges && !window.confirm("You have unsaved changes. Discard them?")) return;
    closeForm();
  };

  function openEditPrototyper() {
    if (!prototyper) return;
    setEditName(prototyper.name);
    setEditRole(prototyper.role);
    setEditEmail(prototyper.email);
    setOrigPrototyper({ name: prototyper.name, role: prototyper.role, email: prototyper.email });
    setShowEditPrototyper(true);
  }

  const confirmCloseEditPrototyper = () => {
    if (prototyperHasChanges && !window.confirm("You have unsaved changes. Discard them?")) return;
    setShowEditPrototyper(false);
  };

  const handleSavePrototyper = async () => {
    if (!editName.trim()) return;
    setSavingPrototyper(true);
    try {
      const prev = { ...origPrototyper };
      await updateDoc(doc(db, "prototypers", id), {
        name: editName.trim(),
        role: editRole.trim(),
        email: editEmail.trim(),
      });
      const savedName = editName.trim();
      setShowEditPrototyper(false);
      setToast({
        message: `Updated "${savedName}"`,
        onUndo: () => {
          updateDoc(doc(db, "prototypers", id), prev).catch(console.error);
        },
      });
    } catch (err) {
      console.error("Failed to update prototyper:", err);
    } finally {
      setSavingPrototyper(false);
    }
  };

  function openEdit(proto: Prototype) {
    const pt = proto.url ? "link" : proto.fileName ? "file" : "default";
    setTitle(proto.title);
    setDescription(proto.description);
    setStatus(proto.status);
    setProtoType(pt);
    setVariant(proto.variant);
    setUrl(proto.url);
    setFileName(proto.fileName);
    setEditingId(proto.id);
    setOrigProto({ title: proto.title, description: proto.description, status: proto.status, protoType: pt, variant: proto.variant, url: proto.url, fileName: proto.fileName });
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let resolvedFileUrl = "";

      // Upload file to Firebase Storage if file type with a new file selected
      if (protoType === "file" && fileRef) {
        const storagePath = `prototypes/${id}/${Date.now()}_${fileRef.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, fileRef);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              setUploadProgress(
                Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              );
            },
            reject,
            () => resolve()
          );
        });

        resolvedFileUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setUploadProgress(null);
      }

      // When editing a file prototype with no new file, keep existing fileUrl
      const existingProto = editingId
        ? prototypes.find((p) => p.id === editingId)
        : null;

      const data = {
        title: title.trim(),
        description: description.trim(),
        status,
        variant: protoType === "default" ? variant : "default",
        url: protoType === "link" ? url.trim() : "",
        fileName: protoType === "file" ? fileName : "",
        fileUrl:
          protoType === "file"
            ? resolvedFileUrl || existingProto?.fileUrl || ""
            : "",
        modifiedAt: serverTimestamp(),
      };

      if (editingId) {
        // Capture previous values for undo
        const prevProto = prototypes.find((p) => p.id === editingId);
        const prevData = prevProto ? {
          title: prevProto.title,
          description: prevProto.description,
          status: prevProto.status,
          variant: prevProto.variant,
          url: prevProto.url,
          fileName: prevProto.fileName,
          fileUrl: prevProto.fileUrl,
        } : null;
        await updateDoc(doc(db, "prototypers", id, "prototypes", editingId), data);
        const savedTitle = title.trim();
        const savedEditingId = editingId;
        closeForm();
        setToast({
          message: `Updated "${savedTitle}"`,
          onUndo: prevData ? () => {
            updateDoc(doc(db, "prototypers", id, "prototypes", savedEditingId), prevData).catch(console.error);
          } : undefined,
        });
      } else {
        await addDoc(collection(db, "prototypers", id, "prototypes"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        closeForm();
      }
    } catch (err) {
      console.error("Failed to save prototype:", err);
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (protoId: string) => {
    try {
      const proto = prototypes.find((p) => p.id === protoId);
      if (proto?.fileUrl) {
        await deleteObject(ref(storage, proto.fileUrl)).catch(() => {});
      }
      await deleteDoc(doc(db, "prototypers", id, "prototypes", protoId));
    } catch (err) {
      console.error("Failed to delete prototype:", err);
    }
  };

  const latestModified = prototypes.reduce<number | null>((latest, p) => {
    if (!p.modifiedAt) return latest;
    const ts = p.modifiedAt.seconds * 1000;
    return latest === null || ts > latest ? ts : latest;
  }, null);

  if (!prototyper) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-6">
        <Link
          href="/prototypers"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-orange-400"
        >
          &larr; Prototypers
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {prototyper.name}
              </h1>
              {prototyper.role && (
                <StatusBadge status={prototyper.role} styleMap={ROLE_STYLES} />
              )}
            </div>
            {prototyper.email && (
              <p className="mt-0.5 text-xs text-secondary">{prototyper.email}</p>
            )}
            <p className="mt-0.5 text-xs text-muted">
              {prototypes.length} prototype{prototypes.length !== 1 ? "s" : ""}
              {latestModified && (
                <> &middot; Last modified {new Date(latestModified).toLocaleDateString()}</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openEditPrototyper}
              className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
            >
              Edit
            </button>
            <button
              onClick={openCreate}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
            >
              Add Prototype
            </button>
          </div>
        </div>
      </header>

      {/* Create / Edit dialog */}
      <Dialog
        open={showForm}
        onClose={confirmCloseForm}
        title={editingId ? "Edit Prototype" : "Add Prototype"}
        maxWidth="lg"
        onSubmit={handleSave}
        footer={
          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={confirmCloseForm} className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground">Cancel</button>
            <button onClick={handleSave} disabled={!title.trim() || saving || (editingId != null && !editHasChanges)} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : editingId ? "Update Prototype" : "Add Prototype"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              Title
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Compact Feed Exploration"
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this prototype explore?"
              rows={3}
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "in-progress" | "complete")
              }
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-secondary">
              Type
            </label>
            <div className="flex gap-2">
              {([
                { value: "file", label: "Uploaded File" },
                { value: "default", label: "Coded Prototype" },
                { value: "link", label: "Link" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProtoType(opt.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    protoType === opt.value
                      ? "border-orange-500 bg-orange-500/10 text-orange-400"
                      : "border-edge-strong bg-input text-secondary hover:border-edge-strong hover:text-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {protoType === "default" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">
                Variant
              </label>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none"
              >
                {Object.values(VARIANT_PRESETS).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {protoType === "link" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">
                URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}
          {protoType === "file" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">
                File
              </label>
              <input
                type="file"
                accept=".html,.htm,.jsx,.tsx,.zip,.png,.jpg,.jpeg,.gif,.svg,.webp,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFileName(file ? file.name : "");
                  setFileRef(file ?? null);
                }}
                className="w-full text-sm text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-subtle file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary file:cursor-pointer hover:file:bg-subtle"
              />
              <p className="mt-1 text-[10px] text-faint">
                Accepts HTML, JSX/TSX, ZIP, images, and PDF
              </p>
              {editingId && fileName && !fileRef && (
                <p className="mt-1 text-[10px] text-faint">
                  Current: {fileName}
                </p>
              )}
              {uploadProgress !== null && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-subtle">
                    <div
                      className="h-1.5 rounded-full bg-orange-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Dialog>

      {/* Edit Prototyper dialog */}
      <Dialog
        open={showEditPrototyper}
        onClose={confirmCloseEditPrototyper}
        title="Edit Prototyper"
        onSubmit={handleSavePrototyper}
        footer={
          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={confirmCloseEditPrototyper} className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground">Cancel</button>
            <button onClick={handleSavePrototyper} disabled={!editName.trim() || savingPrototyper || !prototyperHasChanges} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {savingPrototyper ? "Saving..." : "Update Prototyper"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Name</label>
            <input
              autoFocus
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Role</label>
            <input
              type="text"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              placeholder="e.g., Designer, Engineer"
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </Dialog>

      {/* Prototypes list */}
      {prototypes.length === 0 ? (
        <div className="mx-auto max-w-2xl py-8">
          <h2 className="text-xl font-bold text-foreground">
            Welcome, {prototyper.name}!
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Create your first prototype. Choose from three types — a self-contained
            HTML file, a React JSX component, or a ZIP bundle with multiple files.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-edge bg-card p-5">
              <p className="text-lg">📄</p>
              <h3 className="mt-2 text-sm font-semibold text-foreground">HTML</h3>
              <p className="mt-1 text-xs text-secondary">
                A single self-contained HTML file with inline CSS and JS.
              </p>
              <a
                href="/boilerplates/starter.html"
                download
                className="mt-3 inline-block text-xs font-medium text-orange-400 transition-colors hover:text-orange-300"
              >
                Download Starter &darr;
              </a>
            </div>

            <div className="rounded-xl border border-edge bg-card p-5">
              <p className="text-lg">⚛️</p>
              <h3 className="mt-2 text-sm font-semibold text-foreground">JSX / TSX</h3>
              <p className="mt-1 text-xs text-secondary">
                A React component file — auto-transpiled and rendered with React 19.
              </p>
              <a
                href="/boilerplates/starter.jsx"
                download
                className="mt-3 inline-block text-xs font-medium text-orange-400 transition-colors hover:text-orange-300"
              >
                Download Starter &darr;
              </a>
            </div>

            <div className="rounded-xl border border-edge bg-card p-5">
              <p className="text-lg">📦</p>
              <h3 className="mt-2 text-sm font-semibold text-foreground">ZIP Archive</h3>
              <p className="mt-1 text-xs text-secondary">
                Bundle HTML, CSS, and JS files together with working relative
                references.
              </p>
              <a
                href="/boilerplates/starter.zip"
                download
                className="mt-3 inline-block text-xs font-medium text-orange-400 transition-colors hover:text-orange-300"
              >
                Download Starter &darr;
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {prototypes.map((proto) => (
            <div
              key={proto.id}
              className="flex items-center justify-between rounded-xl border border-edge bg-card px-5 py-4 transition-colors hover:border-edge-strong"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {proto.title}
                  </h3>
                  <StatusBadge status={proto.status} styleMap={PROTOTYPE_STATUS_STYLES} />
                </div>
                {proto.description && (
                  <p className="mt-0.5 text-xs text-secondary truncate">
                    {proto.description}
                  </p>
                )}
                {proto.modifiedAt && (
                  <p className="mt-0.5 text-[10px] text-muted">
                    Modified{" "}
                    {new Date(
                      proto.modifiedAt.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                {proto.url ? (
                  <Link
                    href={`/prototype/link/${id}/${proto.id}`}
                    target="_blank"
                    className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
                  >
                    Preview
                  </Link>
                ) : proto.fileName ? (
                  <Link
                    href={`/prototype/uploaded/${id}/${proto.id}`}
                    target="_blank"
                    className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
                  >
                    Preview
                  </Link>
                ) : (
                  <Link
                    href={`/prototype?variant=${proto.variant}`}
                    target="_blank"
                    className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
                  >
                    Preview
                  </Link>
                )}
                <button
                  onClick={() => openEdit(proto)}
                  className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-orange-500/10 hover:text-orange-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setConfirmState({ message: `Delete "${proto.title}"?`, action: () => handleDelete(proto.id) });
                  }}
                  className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.onUndo}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => confirmState?.action()}
        message={confirmState?.message ?? ""}
      />
    </div>
  );
}
