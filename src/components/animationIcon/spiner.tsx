import { motion } from "framer-motion";

// --- 1. スピナーローダー (円形) ---
// 一般的な回転するローダーです。
export const SpinnerLoader = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        style={{
          width: 25,
          height: 25,
          border: "5px solid #e9e9e9",
          borderTop: "5px solid #3498db",
          borderRadius: "50%",
        }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 1,
        }}
      />
    </div>
  );
};
