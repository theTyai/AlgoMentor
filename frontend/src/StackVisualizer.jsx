function StackVisualizer({ stack, action, fnName }) {
  const frames = Array.isArray(stack) ? stack : [];

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
        <strong style={{ color: "#0f172a" }}>Call Stack</strong>
        <span style={{ color: "#475569", fontSize: "14px" }}>
          Top at bottom
        </span>
      </div>

      <div
        style={{
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: "10px",
          padding: "8px 0"
        }}
      >
        {frames.length === 0 ? (
          <div
            style={{
              padding: "14px",
              borderRadius: "12px",
              border: "1px dashed #cbd5e1",
              backgroundColor: "#f8fafc",
              color: "#64748b",
              textAlign: "center"
            }}
          >
            Stack is empty
          </div>
        ) : (
          frames.map((value, index) => {
            const isTopFrame = index === frames.length - 1;

            return (
              <div
                key={`${value}-${index}-${action}`}
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: isTopFrame ? "2px solid #2563eb" : "1px solid #cbd5e1",
                  backgroundColor: isTopFrame ? "#dbeafe" : "#f8fafc",
                  color: "#0f172a",
                  fontWeight: isTopFrame ? 700 : 600,
                  boxShadow: isTopFrame
                    ? action === "call"
                      ? "0 0 0 4px rgba(34, 197, 94, 0.14)"
                      : "0 0 0 4px rgba(245, 158, 11, 0.14)"
                    : "none",
                  transform: isTopFrame
                    ? action === "call"
                      ? "translateY(-4px)"
                      : "translateY(4px)"
                    : "translateY(0)",
                  transition: "all 0.25s ease"
                }}
              >
                {fnName || "fn"}({value})
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StackVisualizer;
