import React from "react";
import "@/components/App.css";
import Settings from "@/components/Misc/Settings";
import { CardBase, CardInside, SubList } from "@/components/Layout/CardComp";
import { useTranslation } from "react-i18next";

function cardMake(title: string, children: React.ReactNode) {
  return (
    <CardBase title={title}>
      <CardInside className="no-vertical-padding">
        <SubList>
          <div className="cardRight othercardtext">{children}</div>
        </SubList>
      </CardInside>
    </CardBase>
  );
}

export default function Other() {
  const { t } = useTranslation();

  return (
    <div className="drawerBar">
      <Settings />
      {cardMake(t("CardTitles.UPDATES"), [
        <h4 className="lastText" key="version" style={{ textAlign: "left" }}>
          Dark, English. 4.19.26
        </h4>,
      ])}
    </div>
  );
}
