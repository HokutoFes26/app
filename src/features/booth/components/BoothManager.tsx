"use client";

import React from "react";
import { Button } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import BoothStatusSelector from "@/features/booth/components/BoothStatusSelector";
import BoothHandoverQR from "@/features/booth/components/BoothHandoverQR";
import { motion } from "framer-motion";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useBoothManager } from "@/features/booth/hooks/useBoothManager";
import styles from "./BoothManager.module.css";

export default function BoothManager() {
  const {
    assignedStall,
    crowd,
    setCrowd,
    stock,
    setStock,
    isDirty,
    loading,
    showSuccess,
    myStall,
    crowdOptions,
    stockOptions,
    statusColors,
    handleUpdate,
    checkDirty,
  } = useBoothManager();

  return (
    <CardBase title="Booth Manager" disableTapAnimation={true}>
      <CardInside>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.stallName}>模擬店名 : {assignedStall || "Loading..."}</span>
            <div className={styles.statusDisplay}>
              <span className={styles.statusLabel}>反映されている状態:</span>
              <span
                className={styles.statusValue}
                style={{ color: statusColors[myStall?.crowdLevel ?? 0] }}
              >
                {crowdOptions[myStall?.crowdLevel ?? 0]}
              </span>
              <span className={styles.statusSeparator}>|</span>
              <span
                className={styles.statusValue}
                style={{ color: statusColors[myStall?.stockLevel ?? 0] }}
              >
                {stockOptions[myStall?.stockLevel ?? 0]}
              </span>
            </div>
          </div>

          <BoothStatusSelector
            label="混雑状況"
            value={crowd}
            onChange={(val) => {
              setCrowd(val);
              checkDirty(val, stock);
            }}
            options={crowdOptions}
          />

          <BoothStatusSelector
            label="在庫状況"
            value={stock}
            onChange={(val) => {
              setStock(val);
              checkDirty(crowd, val);
            }}
            options={stockOptions}
          />

          <div className={styles.buttonWrapper}>
            <Button
              type="primary"
              block
              size="large"
              onClick={handleUpdate}
              loading={loading}
              className={`${styles.updateButton} ${showSuccess ? styles.successButton : ""}`}
            >
              {showSuccess ? (
                <span className={styles.successContent}>
                  <CheckCircleRoundedIcon /> 更新完了
                </span>
              ) : (
                "情報を更新する"
              )}
            </Button>
          </div>

          {isDirty && !showSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={styles.dirtyBanner}
            >
              <span className={styles.dirtyText}>変更が未反映です</span>
              <span className={styles.dirtySubText}>「情報を更新する」ボタンを押すと公開されます</span>
            </motion.div>
          )}
          <Divider />
          <BoothHandoverQR assignedStall={assignedStall} />
        </div>
      </CardInside>
    </CardBase>
  );
}
