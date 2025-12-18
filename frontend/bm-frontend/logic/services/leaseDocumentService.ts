import api from "./apiClient";

export const LeaseDocumentService = {
  list: (leaseId: number) =>
    api.get("/documents/lease-documents/", {
      params: { lease: leaseId },
    }).then(r => r.data),

  upload: (formData: FormData) =>
    api.post("/documents/lease-documents/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: number) =>
    api.delete(`/documents/lease-documents/${id}/`),
};
