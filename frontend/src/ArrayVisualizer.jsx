function ArrayVisualizer({ name, values, currentIndex }) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

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

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap"
        }}
      >
        {values.map((value, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={`${name}-${index}`}
              style={{
                minWidth: "64px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: isActive ? "2px solid #2563eb" : "1px solid #cbd5e1",
                backgroundColor: isActive ? "#dbeafe" : "#f8fafc",
                boxShadow: isActive ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: isActive ? "#1d4ed8" : "#64748b",
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
