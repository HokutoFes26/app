"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList } from "@/components/Layout/CardComp";
import Link from "next/link";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function VoteStatus() {
  const { t } = useTranslation();

  return (
    <CardBase title={t("CardTitles.VOTE")} disableTapAnimation={true}>
      <CardInside style={{ cursor: "pointer" }}>
        <Link href="/vote" style={{ textDecoration: "none", color: "inherit" }}>
          <SubList>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                textAlign: "left",
                width: "100%",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "color-mix(in srgb, var(--pop-accent-main) 15%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <HowToVoteIcon style={{ fontSize: "28px", color: "var(--pop-accent-main)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text-color)" }}>
                  {t("Vote.Title")}
                </h4>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-sub-color)", lineHeight: "1.4" }}>
                  {t("Vote.Description")}
                </p>
              </div>
              <ArrowForwardIosIcon style={{ fontSize: "14px", color: "#ccc" }} />
            </div>
          </SubList>
        </Link>
      </CardInside>
    </CardBase>
  );
}
