function ArrayVisualizer({
  name,
  values,
  currentIndex,
  highlightedIndices = [],
  swapped = false
}) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const activeIndices = new Set(
    highlightedIndices.filter((index) => Number.isInteger(index))
  );

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        border: "1px solid #dbeafe"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "12px"
        }}
      >
        <strong style={{ color: "#0f172a" }}>{name}</strong>
        <span style={{ color: "#475569", fontSize: "14px" }}>
          Current index: {Number.isInteger(currentIndex) ? currentIndex : "None"}
        </span>
      </div>

      {swapped ? (
        <div
          style={{
            marginBottom: "12px",
            color: "#b45309",
            fontSize: "14px",
            fontWeight: 600
          }}
        >
          Swap performed in this step
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap"
        }}
      >
        {values.map((value, index) => {
          const isActive = index === currentIndex;
          const isHighlighted = activeIndices.has(index);

          return (
            <div
              key={`${name}-${index}`}
              style={{
                minWidth: "64px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: isHighlighted
                  ? "2px solid #f59e0b"
                  : isActive
                    ? "2px solid #2563eb"
                    : "1px solid #cbd5e1",
                backgroundColor: isHighlighted
                  ? "#fef3c7"
                  : isActive
                    ? "#dbeafe"
                    : "#f8fafc",
                boxShadow: swapped && isHighlighted
                  ? "0 0 0 4px rgba(245, 158, 11, 0.18)"
                  : isActive
                    ? "0 0 0 3px rgba(37, 99, 235, 0.12)"
                    : "none",
                transform: swapped && isHighlighted ? "translateY(-4px)" : "translateY(0)",
                transition: "all 0.25s ease"
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: isHighlighted
                    ? "#b45309"
                    : isActive
                      ? "#1d4ed8"
                      : "#64748b",
                  marginBottom: "6px"
                }}
              >
                [{index}]
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0f172a",
                  textAlign: "center"
                }}
              >
                {String(value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ArrayVisualizer;
