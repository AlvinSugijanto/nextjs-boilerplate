export function handleUniqueErrors(errorResponse, setError) {
  const data = errorResponse?.data || errorResponse;
  if (!data) return;

  // Iterate through each field error
  Object.entries(data).forEach(([field, info]) => {
    const code = info?.code || "";
    const message = info?.message || "Invalid value.";

    // Format label agar rapi (capitalize)
    const formattedField = field
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    // ✅ Tangani hanya validation_not_unique
    if (code === "validation_not_unique") {
      setError(field, {
        type: "server",
        message: `${formattedField} must be unique.`,
      });
    } else {
      // Fallback umum
      setError(field, {
        type: "server",
        message,
      });
    }
  });
}
