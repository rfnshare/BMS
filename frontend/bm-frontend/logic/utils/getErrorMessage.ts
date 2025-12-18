export function getErrorMessage(error: any): string {
  if (!error) return "Something went wrong";

  const data = error?.response?.data;

  // Case 1: Simple string message from backend
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  // Case 2: DRF Serializer errors (the object you received)
  if (data && typeof data === "object") {
    const messages: string[] = [];

    Object.entries(data).forEach(([field, errs]) => {
      // Format the field name (e.g., "full_name" -> "Full Name")
      const friendlyField = field.replace(/_/g, ' ');

      if (Array.isArray(errs)) {
        errs.forEach(err => {
          // If the error is an object/ErrorDetail, try to get .string or .message,
          // otherwise cast to String
          const msg = typeof err === 'object' ? (err.message || String(err)) : err;
          messages.push(`${friendlyField}: ${msg}`);
        });
      } else if (typeof errs === 'string') {
        messages.push(`${friendlyField}: ${errs}`);
      }
    });

    if (messages.length) {
      // Use a newline or bullet point for better UI display
      return messages.join("\n");
    }
  }

  // Case 3: Fallback for network errors
  return error.message || "Request failed. Please check your connection.";
}