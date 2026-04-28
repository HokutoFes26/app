"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPath } from "@/constants/paths";
import styles from "./BoothDetailModal.module.css";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMapControl } from "@/contexts/MapContext";
import ListIcon from "@mui/icons-material/List";

type ProductModalPropsMenu = {
  content: string;
  price: number;
};

export interface BoothItem {
  name: string;
  team?: string;
  place?: string;
  menu?: ProductModalPropsMenu[];
  image?: string;
  image2?: string;
  image_hidden?: string;
}

interface BoothDetailModalProps {
  item: BoothItem;
}

export default function BoothDetailModal({ item }: BoothDetailModalProps) {
  const [show, setShow] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHiddenFromUrl = searchParams.get("hidden") === "true";
  const [showHidden, setShowHidden] = useState(isHiddenFromUrl);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const mapControl = useMapControl();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHiddenFromUrl && item?.image_hidden && Math.random() < 0.35) {
      setShowHidden(true);
    }
  }, [isHiddenFromUrl, item?.name, item?.image_hidden]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShow(true), 10);
      if (mapControl) mapControl.setProductModalOpen(true);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      if (mapControl) mapControl.setProductModalOpen(false);
    }
  }, [isOpen, mapControl]);

  useEffect(() => {
    if (isMenuExpanded && modalRef.current) {
      const scrollTarget = modalRef.current;
      const timer = setTimeout(() => {
        scrollTarget.scrollTo({
          top: scrollTarget.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMenuExpanded]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 200);
  };

  const handleLocationClick = () => {
    if (mapControl && item.place) {
      setIsOpen(false);
      mapControl.openMap(item.place);
      setTimeout(() => {
        router.back();
      }, 300);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${item.name} | 模擬店詳細`,
      text: `${item.name} (${item.team || ""}) の詳細をチェック！`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("URLをクリップボードにコピーしました");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share error:", err);
      }
    }
  };

  const isAccordion = (item.menu?.length ?? 0) >= 4;

  return (
    <div className={`${styles.overlay} ${show ? styles.open : ""}`} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>
          <CloseIcon />
        </button>
        <div className={styles.scrollArea} ref={modalRef}>
          {showHidden && item.image_hidden ? (
            <img src={getPath(item.image_hidden)} alt={item.name} className={styles.image} />
          ) : (
            item.image && (
              <>
                <img src={getPath(item.image)} alt={item.name} className={styles.image} />
                <img src={getPath(item.image)} alt={item.name} className={styles.imageback} />
              </>
            )
          )}
          <div className={styles.content}>
            <p className={styles.name}>{item.name}</p>
            {item.team && <p className={styles.team}>{item.team}</p>}

            <div className={styles.details}>
              {item.place && (
                <div
                  className={`${styles.detailItem} ${mapControl ? styles.clickable : ""}`}
                  onClick={handleLocationClick}
                  style={{ alignItems: "center" }}
                >
                  <div className={styles.iconWrapper}>
                    <LocationOnOutlinedIcon style={{ fontSize: "20px", color: "var(--text-color)" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px" }}>
                      <p className={styles.value}>{item.place}&ensp;</p>
                      {mapControl && (
                        <p style={{ color: "#174ef5", textDecoration: "underline" }} className={styles.mapLink}>
                          地図で見る ↗
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {item.menu && item.menu.length > 0 && (
                <div className={styles.detailItem}>
                  <div className={styles.iconWrapper}>
                    <ListIcon style={{ fontSize: "20px", color: "var(--text-color)" }} />
                  </div>
                  <div style={{ flex: 1, marginTop: "0.5em" }}>
                    {isAccordion ? (
                      <>
                        <div className={styles.accordionHeader} onClick={() => setIsMenuExpanded(!isMenuExpanded)}>
                          <p className={styles.value}>メニューを見る ({item.menu.length}件)</p>
                          <ExpandMoreIcon
                            className={`${styles.accordionIcon} ${isMenuExpanded ? styles.expanded : ""}`}
                          />
                        </div>
                        <div className={`${styles.accordionContent} ${isMenuExpanded ? styles.expanded : ""}`}>
                          {item.menu.map((item_menu, index) => (
                            <div
                              key={index}
                              style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}
                            >
                              <p className={styles.value}>
                                {item_menu.content} : {item_menu.price}円
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      item.menu.map((item_menu, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <p className={styles.value}>
                            {item_menu.content} : {item_menu.price}円
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className={styles.shareBtn} onClick={handleShare}>
              <ShareOutlinedIcon style={{ fontSize: "20px" }} />
              共有する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
