export function getErrorMessage(error: any): string {
  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === "string") return data;
    if (data.error) return data.error;
    if (data.detail) return data.detail;

    // DRF serializer errors
    if (typeof data === "object") {
      return Object.values(data).flat().join(", ");
    }
  }

  return "Something went wrong. Please try again.";
}
