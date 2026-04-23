"use client";
import React, { useEffect, useState } from "react";
import { getPath } from "@/constants/paths";
import styles from "./BoothDetailModal.module.css";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import { useMapControl } from "@/contexts/MapContext";

export interface BoothItem {
    name: string;
    team?: string;
    place?: string;
    image?: string;
    menu?: string;
    price?: string;
}

interface BoothDetailModalProps {
    item: BoothItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function BoothDetailModal({ item, isOpen, onClose }: BoothDetailModalProps) {
    const [show, setShow] = useState(false);
    const mapControl = useMapControl();

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setShow(true), 10);
            if (mapControl) mapControl.setProductModalOpen(true);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
            if (mapControl) mapControl.setProductModalOpen(false);
        }
    }, [isOpen]);

    if (!item && !isOpen) return null;

    const handleClose = () => {
        setShow(false);
        if (mapControl) mapControl.setProductModalOpen(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleLocationClick = () => {
        if (mapControl && item?.place) {
            setShow(false);
            mapControl.setProductModalOpen(false);
            setTimeout(() => {
                onClose();
                mapControl.openMap(item.place);
            }, 300);
        }
    };

    const handleShare = async () => {
        if (!item) return;
        const shareUrl = window.location.href;
        const shareData = {
            title: `${item.name} | 模擬店詳細`,
            text: `${item.name} (${item.team || ""}) の詳細をチェック！`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                await navigator.clipboard.writeText(shareUrl);
                alert("URLをクリップボードにコピーしました");
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = shareUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand("copy");
                    alert("URLをクリップボードにコピーしました");
                } catch (copyErr) {
                    console.error("Copy fallback failed:", copyErr);
                }
                document.body.removeChild(textArea);
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                console.error("Share error:", err);
            }
        }
    };

    return (
        <div className={`${styles.overlay} ${show ? styles.open : ""}`} onClick={handleClose}>
            {item && (
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.closeBtn} onClick={handleClose}>
                        <CloseIcon />
                    </button>
                    {item.image && (
                        <img src={getPath(item.image)} alt={`${item.name}の画像`} className={styles.image} />
                    )}
                    <div className={styles.content}>
                        <span className={styles.name}>{item.name}</span>
                        {item.team && <p className={styles.team}>{item.team}</p>}

                        <div className={styles.details}>
                            {item.place && (
                                <div
                                    className={`${styles.detailItem} ${mapControl ? styles.clickable : ""}`}
                                    onClick={handleLocationClick}
                                >
                                    <div className={styles.iconWrapper}>
                                        <LocationOnOutlinedIcon
                                            style={{ fontSize: "24px", color: "var(--text-color)" }}
                                        />
                                    </div>
                                    <div>
                                        <span className={styles.label}>場所</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <span className={styles.value}>{item.place}</span>
                                            {mapControl && (
                                                <span
                                                    style={{
                                                        cursor: "pointer",
                                                        fontSize: "12px",
                                                        color: "#007aff",
                                                        marginLeft: "4px",
                                                    }}
                                                    className={styles.mapLink}
                                                >
                                                    地図で見る ↗
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {(item.menu || item.price) && (
                                <div className={styles.detailItem}>
                                    <div className={styles.iconWrapper}>
                                        <ListRoundedIcon style={{ fontSize: "24px", color: "var(--text-color)" }} />
                                    </div>
                                    <div>
                                        <span className={styles.label}>メニュー / 値段</span>
                                        <p className={styles.value}>
                                            {item.menu && item.name || "-"} / {item.price ? `(${item.price})` : ""}
                                        </p>
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
            )}
        </div>
    );
}
