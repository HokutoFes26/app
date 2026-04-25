import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

function CardBase(props: { title: string; children: React.ReactNode; SubjectUpdated?: React.ReactNode; disableTapAnimation?: boolean }) {
  return (
    <motion.div
      className="carddiv"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileTap={props.disableTapAnimation ? undefined : { scale: 0.97 }}
    >
      <motion.div layout="position" className="subProp">
        <CardTitle title={props.title} />
        {props.SubjectUpdated ? props.SubjectUpdated : null}
      </motion.div>
      {props.children}
    </motion.div>
  );
}

function CardTitle(props: { title: string }) {
  const { isAdmin, isStallAdmin } = useRole();
  const theme = useTheme();
  const isDark = theme?.isDarkMode || false;
  const titleRed = isDark ? "#ff5c53" : "#FF3B30";
  const titleBlue = isDark ? "#46a2ff" : "#007AFF";
  const firstCharColor = isAdmin || isStallAdmin ? titleRed : titleBlue;

  return (
    <div className="cardTitle">
      <p>
        <span style={{ color: firstCharColor }}>{props.title.slice(0, 1)}</span>
        <span>{props.title.slice(1)}</span>
      </p>
    </div>
  );
}

function SubList(props: { SubNumber?: number; children: React.ReactNode }) {
  let link: React.ReactNode = null;
  if (props.SubNumber !== undefined) {
    if (true) {
      link = <a className="linkButton" href={""} target="_blank" rel="noreferrer"></a>;
    }
  }

  return (
    <div>
      <div style={{ padding: "12px 0", display: "flex", alignItems: "center", width: "100%" }}>{props.children}</div>
      {link}
    </div>
  );
}

function CardInside(props: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (!contentRef.current || !containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      const contentEl = contentRef.current;
      const containerEl = containerRef.current;
      if (!contentEl || !containerEl) return;

      const contentHeight = contentEl.offsetHeight;
      const containerStyle = window.getComputedStyle(containerEl);
      const pt = parseFloat(containerStyle.paddingTop) || 0;
      const pb = parseFloat(containerStyle.paddingBottom) || 0;
      const bt = parseFloat(containerStyle.borderTopWidth) || 0;
      const bb = parseFloat(containerStyle.borderBottomWidth) || 0;
      const isBorderBox = containerStyle.boxSizing === "border-box";
      
      if (isBorderBox) {
        setHeight(contentHeight + pt + pb + bt + bb);
      } else {
        setHeight(contentHeight);
      }
    });

    resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`card ${props.className || ""}`}
      style={{
        ...props.style,
        overflow: "hidden",
      }}
      animate={{ height }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <div ref={contentRef} style={{ display: "flow-root" }}>{props.children}</div>
    </motion.div>
  );
}

function Divider() {
  return <div className="scheList"></div>;
}

export { CardBase, CardInside, SubList, Divider };
