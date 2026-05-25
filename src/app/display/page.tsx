"use client";

import React, { Suspense, useState, useEffect } from "react";
const DisplayView = React.lazy(() => import("@/app/_components/DisplayView"));
import FullPageLoader from "@/components/Layout/FullPageLoader";
import { AnimatePresence, motion } from "framer-motion";
import ClosedView from "@/app/_components/ClosedView";

export default function DisplayPage() {
  const [mounted, setMounted] = useState(false);
  const [showClosedOverlay, setShowClosedOverlay] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <FullPageLoader />;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <AnimatePresence>
        {showClosedOverlay && (
          <motion.div
            key="closed-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 20000, position: "fixed", inset: 0 }}
          >
            <ClosedView onClose={() => setShowClosedOverlay(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <Suspense fallback={<FullPageLoader />}>
        <DisplayView />
      </Suspense>
    </div>
  );
}
